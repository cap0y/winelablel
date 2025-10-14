import { useState, useEffect, useCallback, useMemo } from 'react';
import { adminApi } from '@/services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// 차트 컬러
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6384'];

const SalesStatistics = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [bottleSales, setBottleSales] = useState<any[]>([]);
  
  // 캐싱 관련 상태
  const [dataLoaded, setDataLoaded] = useState({
    summary: false,
    daily: false,
    monthly: false,
    bottles: false
  });
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cacheExpiry] = useState<number>(300000); // 5분 캐시
  
  // 모든 통계 데이터를 병렬로 로드하는 함수
  const fetchAllData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // 캐시가 유효하고 강제 새로고침이 아닌 경우 생략
    if (!forceRefresh && dataLoaded.summary && dataLoaded.daily && dataLoaded.monthly && dataLoaded.bottles && (now - lastFetchTime) < cacheExpiry) {
      console.log("캐시된 통계 데이터 사용");
      return;
    }
    
    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      // 모든 API를 병렬로 호출하여 성능 향상
      const [summaryResponse, dailyResponse, monthlyResponse, bottlesResponse] = await Promise.allSettled([
        adminApi.getSalesSummary(),
        adminApi.getDailySales(),
        adminApi.getMonthlySales(),
        adminApi.getBottleSales()
      ]);
      
      // 성공한 응답들 처리
      if (summaryResponse.status === 'fulfilled') {
        setSummary(summaryResponse.value.data.data);
      }
      
      if (dailyResponse.status === 'fulfilled') {
        setDailySales(dailyResponse.value.data.data);
      }
      
      if (monthlyResponse.status === 'fulfilled') {
        setMonthlySales(monthlyResponse.value.data.data);
      }
      
      if (bottlesResponse.status === 'fulfilled') {
        setBottleSales(bottlesResponse.value.data.data);
      }
      
      // 캐시 상태 업데이트
      setDataLoaded({
        summary: summaryResponse.status === 'fulfilled',
        daily: dailyResponse.status === 'fulfilled',
        monthly: monthlyResponse.status === 'fulfilled',
        bottles: bottlesResponse.status === 'fulfilled'
      });
      
      setLastFetchTime(now);
      
    } catch (error) {
      console.error('통계 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dataLoaded, lastFetchTime, cacheExpiry]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchAllData();
  }, []); // 빈 의존성 배열로 초기 로드만 실행
  
  // 자동 새로고침 (10분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 600000); // 10분
    
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // 차트 데이터를 useMemo로 메모이제이션
  const chartData = useMemo(() => {
    return {
      recentDailySales: [...dailySales].reverse().slice(0, 30),
      topBottles: bottleSales.slice(0, 5)
    };
  }, [dailySales, bottleSales]);

  // 한국어 날짜 포맷 (월)
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}년 ${monthNum}월`;
  };
  
  // 한국어 날짜 포맷 (일)
  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  };
  
  // 금액 포맷
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 차트 컴포넌트들
  const renderSummary = () => {
    if (!summary) return (
      <div className="flex justify-center items-center h-32 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-2"></div>
          <p>요약 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.todaySales)}원</p>
            <p className="text-sm text-gray-400">{summary.todayOrders}건의 주문</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">이번 달 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.thisMonthSales)}원</p>
            <p className="text-sm text-gray-400">
              {summary.lastMonthSales > 0 
                ? `전월 대비 ${Math.round((summary.thisMonthSales - summary.lastMonthSales) / summary.lastMonthSales * 100)}%` 
                : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}원</p>
            <p className="text-sm text-gray-400">총 {summary.totalOrders}건 주문</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">평균 주문 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}원</p>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderDailyChart = () => {
    if (chartData.recentDailySales.length === 0) return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>일별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64 text-gray-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              <p>일별 데이터를 불러오는 중...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
    
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>일별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData.recentDailySales}
                margin={{ top: 8, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '매출']}
                  labelFormatter={(label) => `${label} 매출`}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', borderRadius: 8 }}
                  labelStyle={{ color: '#374151' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Legend wrapperStyle={{ color: '#374151', fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke="#2563eb" activeDot={{ r: 8 }} name="매출" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderMonthlyChart = () => {
    if (monthlySales.length === 0) return <div>데이터 로드 중...</div>;
    
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>월별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySales}
                margin={{ top: 8, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '매출']}
                  labelFormatter={(label) => `${formatMonth(label)}`}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', borderRadius: 8 }}
                  labelStyle={{ color: '#374151' }}
                  itemStyle={{ color: '#111827' }}
                />
                <Legend wrapperStyle={{ color: '#374151', fontSize: 12 }} />
                <Bar dataKey="sales" name="매출" fill="#3b82f6" />
                <Bar dataKey="count" name="주문 수" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderBottlesChart = () => {
    if (bottleSales.length === 0) return <div>데이터 로드 중...</div>;
    
    // 최대 5개만 표시
    const topBottles = bottleSales.slice(0, 5);
    
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>와인별 판매 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topBottles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                  nameKey="name"
                >
                  {topBottles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '매출']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-700">와인명</th>
                  <th className="text-right py-2 text-gray-700">판매량</th>
                  <th className="text-right py-2 text-gray-700">매출</th>
                </tr>
              </thead>
              <tbody>
                {bottleSales.map((bottle, index) => (
                  <tr key={bottle.id} className="border-b border-gray-200">
                    <td className="py-2 text-gray-900">{bottle.name}</td>
                    <td className="text-right py-2 text-gray-900">{bottle.count}개</td>
                    <td className="text-right py-2 text-gray-900">{formatCurrency(bottle.sales)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {renderSummary()}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>{renderDailyChart()}</div>
          <div>{renderBottlesChart()}</div>
        </div>
        
        <div>{renderMonthlyChart()}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">매출 통계</h2>
        <div className="flex items-center space-x-3">
          {isRefreshing && (
            <div className="flex items-center space-x-2 text-cyan-400">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">새로고침 중...</span>
            </div>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => fetchAllData(true)}
            disabled={isRefreshing}
            className="bg-white/70 hover:bg-white/90 text-blue-700 border-gray-300 backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          <div className="text-sm text-gray-600">
            마지막 업데이트: {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : '없음'}
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 gap-2 bg-white/70 border border-gray-200 backdrop-blur-sm">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="daily">일별 매출</TabsTrigger>
          <TabsTrigger value="monthly">월별 매출</TabsTrigger>
          <TabsTrigger value="bottles">와인별 매출</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              <p className="text-gray-400">통계 데이터를 불러오는 중...</p>
              <p className="text-sm text-gray-500">모든 데이터를 병렬로 로딩합니다.</p>
            </div>
          ) : renderDashboard()}
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          {renderSummary()}
        </TabsContent>
        
        <TabsContent value="daily" className="mt-6">
          {renderDailyChart()}
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6">
          {isLoading ? <div>데이터 로드 중...</div> : renderMonthlyChart()}
        </TabsContent>
        
        <TabsContent value="bottles" className="mt-6">
          {isLoading ? <div>데이터 로드 중...</div> : renderBottlesChart()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesStatistics; 