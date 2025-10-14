import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// TooltipProvider는 개별 컴포넌트에서 필요시 사용하도록 변경
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WineBottleSelector from "@/pages/wine-bottle-selector";
import LabelDesigner from "@/pages/label-designer";
import Checkout from "@/pages/checkout";
import Contact from "@/pages/contact";
import Gallery from "@/pages/gallery";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/footer";
import { LanguageProvider } from "@/contexts/language-context";
import { AuthProvider } from "@/contexts/auth-context";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import KakaoCallback from "@/pages/oauth/kakao/callback";
import ProfilePage from "@/pages/profile";
import PaymentSuccess from "@/pages/payment/success";
import PaymentFailure from "@/pages/payment/failure";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import OrderManagement from "@/components/admin/OrderManagement";

// OrderHistory 임포트 경로 수정
import OrderHistory from "@/pages/order-history";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import CookiePolicy from "@/pages/cookie-policy";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/wine-bottles" component={WineBottleSelector} />
          <Route path="/label-designer/:bottleId" component={LabelDesigner} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/payment/failure" component={PaymentFailure} />
          <Route path="/payment" component={Checkout} />
          <Route path="/contact" component={Contact} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/oauth/kakao/callback" component={KakaoCallback} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/profile/:tab" component={ProfilePage} />
          <Route path="/orders" component={OrderHistory} />
          <Route path="/orders/:orderId" component={OrderHistory} />
          <Route path="/admin/orders" component={OrderManagement} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <div>
            <Toaster />
            <Router />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
