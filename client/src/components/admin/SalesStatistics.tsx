import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 차트 컬러
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6384'];

const SalesStatistics = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [bottleSales, setBottleSales] = useState<any[]>([]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // 선택된 탭에 따라 필요한 데이터만 로드
        if (activeTab === 'summary' || activeTab === 'dashboard') {
          const summaryResponse = await adminApi.getSalesSummary();
          setSummary(summaryResponse.data.data);
        }
        
        if (activeTab === 'daily' || activeTab === 'dashboard') {
          const dailyResponse = await adminApi.getDailySales();
          setDailySales(dailyResponse.data.data);
        }
        
        if (activeTab === 'monthly' || activeTab === 'dashboard') {
          const monthlyResponse = await adminApi.getMonthlySales();
          setMonthlySales(monthlyResponse.data.data);
        }
        
        if (activeTab === 'bottles' || activeTab === 'dashboard') {
          const bottlesResponse = await adminApi.getBottleSales();
          setBottleSales(bottlesResponse.data.data);
        }
      } catch (error) {
        console.error('통계 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

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
    if (!summary) return <div>데이터 로드 중...</div>;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.todaySales)}원</p>
            <p className="text-sm text-gray-400">{summary.todayOrders}건의 주문</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
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
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}원</p>
            <p className="text-sm text-gray-400">총 {summary.totalOrders}건 주문</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
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
    if (dailySales.length === 0) return <div>데이터 로드 중...</div>;
    
    // 최근 30일 데이터만 표시
    const recentData = [...dailySales].reverse().slice(0, 30);
    
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>일별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={recentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '매출']}
                  labelFormatter={(label) => `${label} 매출`}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="매출" />
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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>월별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySales}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" tickFormatter={formatMonth} stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  formatter={(value: number) => [`${formatCurrency(value)}원`, '매출']}
                  labelFormatter={(label) => `${formatMonth(label)}`}
                />
                <Legend />
                <Bar dataKey="sales" name="매출" fill="#8884d8" />
                <Bar dataKey="count" name="주문 수" fill="#82ca9d" />
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
      <Card className="bg-gray-800 border-gray-700">
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
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">와인명</th>
                  <th className="text-right py-2">판매량</th>
                  <th className="text-right py-2">매출</th>
                </tr>
              </thead>
              <tbody>
                {bottleSales.map((bottle, index) => (
                  <tr key={bottle.id} className="border-b border-gray-700">
                    <td className="py-2">{bottle.name}</td>
                    <td className="text-right py-2">{bottle.count}개</td>
                    <td className="text-right py-2">{formatCurrency(bottle.sales)}원</td>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="dashboard">대시보드</TabsTrigger>
          <TabsTrigger value="summary">요약</TabsTrigger>
          <TabsTrigger value="daily">일별 매출</TabsTrigger>
          <TabsTrigger value="monthly">월별 매출</TabsTrigger>
          <TabsTrigger value="bottles">와인별 매출</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          {isLoading ? <div>데이터 로드 중...</div> : renderDashboard()}
        </TabsContent>
        
        <TabsContent value="summary" className="mt-6">
          {isLoading ? <div>데이터 로드 중...</div> : renderSummary()}
        </TabsContent>
        
        <TabsContent value="daily" className="mt-6">
          {isLoading ? <div>데이터 로드 중...</div> : renderDailyChart()}
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