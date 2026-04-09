import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Zap, RefreshCw } from 'lucide-react';

const LCSimulator = () => {
  // 상태 관리: 주파수(Hz), 인덕턴스(mH), 커패시턴스(uF)
  const [frequency, setFrequency] = useState(60);
  const [inductance, setInductance] = useState(50);
  const [capacitance, setCapacitance] = useState(50);

  // 리액턴스 계산
  const XL = useMemo(() => {
    return (2 * Math.PI * frequency * (inductance / 1000)).toFixed(2);
  }, [frequency, inductance]);

  const XC = useMemo(() => {
    return (1 / (2 * Math.PI * frequency * (capacitance / 1000000))).toFixed(2);
  }, [frequency, capacitance]);

  // 파형 데이터 생성
  const chartData = useMemo(() => {
    const data = [];
    const points = 100;
    // 주파수에 따라 파형이 잘 보이도록 3주기(cycle) 분량의 시간 설정
    const maxTime = 3 * (1 / frequency); 

    for (let i = 0; i <= points; i++) {
      const t = (i / points) * maxTime;
      const wt = 2 * Math.PI * frequency * t;
      
      data.push({
        time: (t * 1000).toFixed(1), // ms 단위
        voltage: Math.sin(wt), // 기준 전압
        currentL: Math.sin(wt - Math.PI / 2), // 지상 전류 (90도 느림)
        currentC: Math.sin(wt + Math.PI / 2), // 진상 전류 (90도 빠름)
      });
    }
    return data;
  }, [frequency]);

  return (
    <div className="p-6 max-w-5xl mx-auto bg-slate-50 rounded-2xl shadow-xl font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-blue-600" />
          코일(L) & 콘덴서(C) 쌍대성 시뮬레이터
        </h2>
        <p className="text-slate-600 mt-2">
          주파수와 소자 값을 조절하여 리액턴스의 변화와 전압-전류의 위상차를 직관적으로 확인해보세요.
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            주파수 (Frequency, $f$) : {frequency} Hz
          </label>
          <input 
            type="range" min="10" max="120" value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-orange-500">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            인덕턴스 (Inductance, $L$) : {inductance} mH
          </label>
          <input 
            type="range" min="10" max="200" value={inductance}
            onChange={(e) => setInductance(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            커패시턴스 (Capacitance, $C$) : {capacitance} μF
          </label>
          <input 
            type="range" min="10" max="200" value={capacitance}
            onChange={(e) => setCapacitance(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* 계산 결과 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-between">
          <div>
            <h3 className="text-orange-800 font-bold mb-1">유도성 리액턴스 ($X_L$)</h3>
            <p className="text-sm text-orange-600/80">$X_L = 2\pi f L$</p>
          </div>
          <div className="text-3xl font-black text-orange-600">
            {XL} <span className="text-xl font-medium">Ω</span>
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <h3 className="text-emerald-800 font-bold mb-1">용량성 리액턴스 ($X_C$)</h3>
            <p className="text-sm text-emerald-600/80">$X_C = \frac{1}{2\pi f C}$</p>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {XC} <span className="text-xl font-medium">Ω</span>
          </div>
        </div>
      </div>

      {/* 파형 그래프 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-center font-bold text-slate-700 mb-4 flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-500" />
            코일 (Inductor) - 지상 전류
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" label={{ value: '시간 (ms)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[-1.5, 1.5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="voltage" name="전압 (V)" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="currentL" name="전류 (I)" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">전류가 전압보다 위상이 90°(π/2) 늦습니다.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-center font-bold text-slate-700 mb-4 flex justify-center items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            콘덴서 (Capacitor) - 진상 전류
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" label={{ value: '시간 (ms)', position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[-1.5, 1.5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="voltage" name="전압 (V)" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="currentC" name="전류 (I)" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">전류가 전압보다 위상이 90°(π/2) 빠릅니다.</p>
        </div>
      </div>
    </div>
  );
};

export default LCSimulator;