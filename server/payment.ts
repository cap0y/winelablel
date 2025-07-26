import { PortOneClient } from "@portone/server-sdk";
import { Webhook } from "@portone/server-sdk";
import { z } from "zod";
import { db } from "./db";
import { reservations } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";

// 포트원 클라이언트 초기화
const portone = PortOneClient({
  secret:
    process.env.V2_API_SECRET ||
    "XlhNElclPwzu6HRvmgjGV17ZLsnyzFPXa0R0NkXSymPgTPt8C8AeeytLDMqVAoHO7H2fD0b9QXD1e21S",
});

// 결제 정보 저장소
const paymentStore = new Map();

// 결제 완료 요청 스키마
const paymentCompleteSchema = z.object({
  paymentId: z.string(),
});

// 결제 정보 동기화 함수
async function syncPayment(paymentId: string) {
  console.log(`결제 정보 동기화 시작: ${paymentId}`);

  // 결제 정보가 없으면 초기화
  if (!paymentStore.has(paymentId)) {
    console.log(`새 결제 정보 초기화: ${paymentId}`);
    paymentStore.set(paymentId, {
      status: "PENDING",
    });
  }

  const payment = paymentStore.get(paymentId);
  let actualPayment;

  try {
    // 포트원 API로 결제 정보 조회
    console.log(`포트원 API 결제 정보 조회: ${paymentId}`);
    actualPayment = await portone.payment.getPayment({ paymentId });
    console.log(`포트원 결제 정보 응답:`, actualPayment);
  } catch (e) {
    // 포트원 에러 처리
    console.error(`포트원 결제 정보 조회 에러:`, e);
    if (e instanceof Error && e.name === "PortOneError") return false;
    throw e;
  }

  // 결제가 완료된 경우
  if (actualPayment.status === "PAID") {
    console.log(`결제 상태 확인: PAID`);

    if (!verifyPayment(actualPayment)) {
      console.error(`결제 정보 검증 실패:`, actualPayment);
      return false;
    }

    if (payment.status === "PAID") {
      console.log(`이미 처리된 결제: ${paymentId}`);
      return payment;
    }

    payment.status = "PAID";
    console.info("결제 성공", actualPayment);

    // 결제 정보에서 커스텀 데이터 추출
    try {
      if (actualPayment.customData) {
        let customData;
        try {
          // 문자열이면 파싱, 아니면 그대로 사용
          if (typeof actualPayment.customData === "string") {
            customData = JSON.parse(actualPayment.customData);
          } else {
            // 객체이면 그대로 사용
            customData = actualPayment.customData;
          }

          console.log(`커스텀 데이터 파싱 성공:`, customData);

          // 예약 정보 업데이트
          if (customData && customData.reservationId) {
            console.log(
              `예약 정보 업데이트 시작: 예약 ID ${customData.reservationId}`,
            );

            await db
              .update(reservations)
              .set({
                status: "active", // 'pending'에서 'active'로 변경
              })
              .where(eq(reservations.id, parseInt(customData.reservationId)))
              .execute();

            console.log(
              `예약 정보 업데이트 완료: 예약 ID ${customData.reservationId}`,
            );
          } else {
            console.log(`유효한 예약 ID가 없음:`, customData);
          }
        } catch (parseError) {
          console.error(`커스텀 데이터 파싱 실패:`, parseError);
        }
      } else {
        console.log(`커스텀 데이터 없음`);
      }
    } catch (error) {
      console.error("결제 후 예약 정보 업데이트 실패:", error);
    }
  } else {
    console.log(`결제 상태가 PAID가 아님: ${String(actualPayment.status)}`);
    return false;
  }

  return payment;
}

// 결제 정보 검증 함수
function verifyPayment(payment: any) {
  console.log(`결제 정보 검증 시작`);

  // 라이브 채널인지 확인 (테스트 환경에서는 검증 생략)
  if (
    process.env.NODE_ENV === "production" &&
    payment.channel.type !== "LIVE"
  ) {
    console.error(`프로덕션 환경에서 테스트 채널 사용 불가`);
    return false;
  }

  // 커스텀 데이터 확인
  if (payment.customData == null) {
    console.error(`커스텀 데이터 없음`);
    return false;
  }

  console.log(`결제 정보 검증 성공`);
  return true;
}

// 라우트 등록 함수
export function registerPaymentRoutes(app: any) {
  // 결제 완료 처리 API
  app.post(
    "/api/payment/complete",
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("결제 완료 API 호출됨: ", req.body);

      try {
        // 유연한 파라미터 처리를 위해 try-catch로 감싸기
        let paymentId;
        try {
          const result = paymentCompleteSchema.parse(req.body);
          paymentId = result.paymentId;
        } catch (validationError) {
          console.error("요청 유효성 검사 실패:", validationError);
          return res.status(400).json({
            error: "올바르지 않은 요청입니다. paymentId가 필요합니다.",
            details: validationError,
          });
        }

        if (typeof paymentId !== "string") {
          console.error("paymentId가 문자열이 아님:", paymentId);
          return res
            .status(400)
            .json({ error: "paymentId는 문자열이어야 합니다." });
        }

        console.log(`결제 동기화 시작: ${paymentId}`);
        const payment = await syncPayment(paymentId);

        if (!payment) {
          console.error(`결제 동기화 실패: ${paymentId}`);
          return res
            .status(400)
            .json({
              error: "결제 동기화에 실패했습니다. 결제 상태를 확인해주세요.",
            });
        }

        console.log(
          `결제 완료 처리 성공: ${paymentId}, 상태: ${payment.status}`,
        );
        res.status(200).json({
          status: payment.status,
        });
      } catch (e) {
        console.error("결제 완료 처리 중 예외 발생:", e);
        res.status(500).json({ error: "서버 내부 오류가 발생했습니다." });
        next(e);
      }
    },
  );

  // 웹훅 처리 API
  app.post(
    "/api/payment/webhook",
    // 웹훅 요청의 본문을 텍스트로 받기 위한 미들웨어
    (req: Request, res: Response, next: NextFunction) => {
      let data = "";
      req.on("data", (chunk: any) => {
        data += chunk;
      });
      req.on("end", () => {
        (req as any).rawBody = data;
        next();
      });
    },
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("웹훅 수신됨");

      try {
        let webhook;
        try {
          webhook = await Webhook.verify(
            process.env.V2_WEBHOOK_SECRET || "test_webhook_secret", // 테스트 키로 기본값 설정
            (req as any).rawBody,
            req.headers,
          );
          console.log("웹훅 검증 성공:", webhook);
        } catch (e) {
          console.error("웹훅 검증 실패:", e);
          if (e instanceof Error && e.name === "WebhookVerificationError") {
            return res.status(400).end();
          }
          throw e;
        }

        if ("data" in webhook && "paymentId" in webhook.data) {
          console.log(`웹훅에서 결제 동기화 시작: ${webhook.data.paymentId}`);
          await syncPayment(webhook.data.paymentId);
        } else {
          console.log("웹훅에 paymentId가 없음:", webhook);
        }

        res.status(200).end();
      } catch (e) {
        console.error("웹훅 처리 중 에러:", e);
        next(e);
      }
    },
  );
}
