import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { fetchSymbolData2 } from '../api/api';

interface SymbolSelectProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string, pricePrecision: number, market: string) => void;
}

interface SymbolOption {
  value: string;
  label: string;
  displayLabel: string;
  pricePrecision: number;
  market: string;
  fullMarket: string;
}

const SymbolSelect: React.FC<SymbolSelectProps> = ({ selectedSymbol, onSymbolChange }) => {
  const [symbols, setSymbols] = useState<SymbolOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const selectRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Market mapping
  const getFullMarketName = (market: string): string => {
    const marketMap: { [key: string]: string } = {
      'crypto': 'CRYPTO',
      'forex': 'FOREX',
      'bist': 'BIST',
      'nasdaq': 'NASDAQ',
      'index': 'INDEX',
      // Add more mappings as needed
    };
    return marketMap[market.toLowerCase()] || market.toUpperCase();
  };

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetchSymbolData2();
        const symbolOptions = response.map((symbolObj: { symbol_text: string; price_precision: number; market: string }) => {
          const fullMarket = getFullMarketName(symbolObj.market);
          return {
            value: symbolObj.symbol_text,
            label: `${symbolObj.symbol_text} ${fullMarket}`,
            displayLabel: symbolObj.symbol_text, // For main display
            pricePrecision: symbolObj.price_precision,
            market: symbolObj.market,
            fullMarket: fullMarket,
          };
        });
        setSymbols(symbolOptions);
      } catch (error) {
        setError('Error fetching symbols');
      } finally {
        setLoading(false);
      }
    };

    fetchSymbols();
  }, []);

  useEffect(() => {
    if (isPopupOpen) {
      const chartContainer = document.querySelector('.chart-container') as HTMLElement;
      if (chartContainer) {
        chartContainer.style.pointerEvents = 'none';
      }
      document.body.style.overflow = 'hidden';
    } else {
      const chartContainer = document.querySelector('.chart-container') as HTMLElement;
      if (chartContainer) {
        chartContainer.style.pointerEvents = 'auto';
      }
      document.body.style.overflow = 'auto';
    }

    return () => {
      const chartContainer = document.querySelector('.chart-container') as HTMLElement;
      if (chartContainer) {
        chartContainer.style.pointerEvents = 'auto';
      }
      document.body.style.overflow = 'auto';
    };
  }, [isPopupOpen]);

  const handleChange = (selectedOption: SymbolOption | null) => {
    if (selectedOption) {
      onSymbolChange(selectedOption.value, selectedOption.pricePrecision, selectedOption.market);
      setIsPopupOpen(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false);
    }
  };

  const selectedOption = symbols.find(option => option.value === selectedSymbol);

  if (loading) return <div>Loading symbols...</div>;
  if (error) return <div>{error}</div>;

  const formatOptionLabel = ({ value, fullMarket }: SymbolOption) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <span>{value}</span>
      <span style={{ color: '#8a8f9d' }}>{fullMarket}</span>
    </div>
  );

  return (
    <div className="symbol-select-container" style={{ position: 'relative' }}>
      <div
        className="symbol-select-trigger"
        onClick={() => setIsPopupOpen(true)}
        style={{
          cursor: 'pointer',
          padding: '8px 12px',
          width: '100px',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#ffffff',
        }}
      >
        {/* .fetch-button {
  padding: 0.25rem 0.2rem;
  background-color: transparent;
  color: white;
  
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  position: relative;
  z-index: 1;
  height: 38px;
}

.fetch-button::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ff6ec4, #7873f5);
  border-radius: 6px;
  z-index: -1;
  transition: opacity 0.3s;
  opacity: 0;
} */}
        {selectedOption ? selectedOption.displayLabel : 'Select Symbol'}
      </div>

      {isPopupOpen && (
        <>
          {/* First overlay to prevent any transparency */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#131722',
              zIndex: 9999,
            }}
          />
          
          {/* Main overlay with content */}
          <div
            className="popup-overlay"
            onClick={handleOverlayClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#131722',
              zIndex: 10000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '60px',
            }}
          >
            <div
              ref={popupRef}
              className="popup-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#131722',
                width: '600px',
                maxHeight: '80vh',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 10001,
                backdropFilter: 'none',
              }}
            >
              {/* Search header */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #2a2f3d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#131722',
              }}>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px' }}>Symbol Search</h3>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Search body */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#131722',
                position: 'relative',
              }}>
                <Select
                  ref={selectRef}
                  value={null}
                  onChange={handleChange}
                  options={symbols}
                  formatOptionLabel={formatOptionLabel}
                  placeholder="Search symbol..."
                  isSearchable
                  autoFocus
                  menuIsOpen={true}
                  onInputChange={(inputValue) => setSearchText(inputValue)}
                  inputValue={searchText}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#131722',
                      borderColor: '#2a2f3d',
                      borderRadius: '4px',
                      minHeight: '40px',
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#3a3f4d',
                      },
                    }),
                    input: (base) => ({
                      ...base,
                      color: '#ffffff',
                      margin: 0,
                      padding: 0,
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#131722',
                      marginTop: '8px',
                      boxShadow: 'none',
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: 'calc(80vh - 160px)',
                      overflowY: 'auto',
                      overflowX: 'auto',
                      backgroundColor: '#131722',
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#1a1f2d',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#4a4f5d',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#5a5f6d',
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#2a2f3d' : '#131722',
                      color: '#ffffff',
                      padding: '12px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#2a2f3d',
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#8a8f9d',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#ffffff',
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SymbolSelect;