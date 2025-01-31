import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import TvPage from './pages/TvPage';
import FreqPage from './pages/FreqPage';
import CandlestickPage from './pages/CandlestickPage';
import WelcomePage from './pages/WelcomePage';
import TablePage from './pages/TablePage';
import TradePage from './pages/TradePage';
// import RealTimeChartPage from './pages/RealTimeChartPage';
import { Layout } from './components/Layout';
import './App.css';
import RsPage from './pages/RsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    // Fix for mobile viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/candle" element={<CandlestickPage />} />
            <Route path="/tv" element={<TvPage />} />
            <Route path="/freq" element={<FreqPage />} />
            <Route path="/table" element={<TablePage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/rs" element={<RsPage />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}