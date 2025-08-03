import { useState, useEffect } from 'react';
import { userApi } from '@/services/api';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { PackageSearch, AlertCircle, Activity, CreditCard } from 'lucide-react';

// 차트 컬러
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6384'];

const UserSalesStatistics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user || !user.email) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await userApi.getUserStats(user.email);
        if (response.data && response.data.success) {
          setStats(response.data.stats);
        } else {
          setError('통계 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('사용자 통계 로드 오류:', err);
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  // 금액 포맷
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // 오류 발생 시
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 데이터가 없는 경우
  if (!stats) {
    return (
      <Alert className="mb-4">
        <PackageSearch className="h-4 w-4" />
        <AlertDescription>주문 통계 데이터가 없습니다. 첫 주문을 해보세요!</AlertDescription>
      </Alert>
    );
  }

  // 상태별 주문 데이터 가공
  const statusData = [
    { name: '결제대기', value: stats.statusCounts?.pending || 0 },
    { name: '처리중', value: stats.statusCounts?.processed || 0 },
    { name: '완료', value: stats.statusCounts?.completed || 0 },
    { name: '취소', value: stats.statusCounts?.cancelled || 0 }
  ].filter(item => item.value > 0);

  // 월별 주문 데이터
  const monthlyData = stats.monthlyOrders || [];

  return (
    <div className="space-y-6">
      {/* 요약 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">총 주문 수</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-cyan-500 mr-2" />
              <p className="text-2xl font-bold">{stats.totalOrders || 0}건</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">총 지출액</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent || 0)}원</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">최근 주문</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.recentOrder ? (
              <div>
                <p className="text-lg font-semibold">{stats.recentOrder.bottleName}</p>
                <p className="text-sm text-gray-400">{formatDate(stats.recentOrder.createdAt)}</p>
                <p className="text-sm font-medium mt-1">{formatCurrency(stats.recentOrder.amount || 0)}원</p>
              </div>
            ) : (
              <p className="text-gray-400">최근 주문 정보가 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 주문 상태 차트 */}
      {statusData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>주문 상태별 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}건`, '주문 수']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 월별 주문 차트 */}
      {monthlyData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>월별 주문 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="month" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    formatter={(value: any) => [`${formatCurrency(value)}원`, '금액']}
                    contentStyle={{ backgroundColor: '#333', border: '1px solid #555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="amount" fill="#0088FE" name="주문 금액" />
                  <Bar dataKey="count" fill="#00C49F" name="주문 수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSalesStatistics; 