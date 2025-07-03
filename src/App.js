import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Heart, Star, Mail } from 'lucide-react';

const App = () => {
  const [fundingType, setFundingType] = useState('15');
  const [fundingPattern, setFundingPattern] = useState('stretched');
  const [attendanceDays, setAttendanceDays] = useState([]);
  const [results, setResults] = useState(null);

  const RATES = {
    hourlyRate: 9.10,
    enrichmentFullyFunded: 22.50,
    enrichmentPartFunded: 10.00
  };

  const FUNDING_HOURS = {
    '15': { stretched: 11.18, termTime: 15 },
    '30': { stretched: 22.35, termTime: 30 }
  };

  const sessionTypes = [
    { value: 'full', label: 'Full Day (7:30am - 5:30pm)', hours: 10 },
    { value: 'morning', label: 'Morning Session (7:30am - 12:30pm)', hours: 5 },
    { value: 'afternoon', label: 'Afternoon Session (12:30pm - 5:30pm)', hours: 5 }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const calculateFees = useCallback(() => {
    if (attendanceDays.filter(day => day).length === 0) {
      setResults(null);
      return;
    }

    const weeklyFundingHours = FUNDING_HOURS[fundingType][fundingPattern];
    let remainingFundingHours = weeklyFundingHours;
    
    const dailyBreakdown = attendanceDays.map((sessionType, dayIndex) => {
      if (!sessionType) return null;

      const session = sessionTypes.find(s => s.value === sessionType);
      const sessionHours = session.hours;
      
      const fundedHours = Math.min(remainingFundingHours, sessionHours);
      remainingFundingHours = Math.max(0, remainingFundingHours - fundedHours);
      
      const unfundedHours = sessionHours - fundedHours;
      const unfundedCost = unfundedHours * RATES.hourlyRate;
      
      const isFullyFunded = fundedHours === sessionHours;
      const enrichmentFee = isFullyFunded ? RATES.enrichmentFullyFunded : 
                           (fundedHours > 0 ? RATES.enrichmentPartFunded : 0);
      
      const totalDailyCost = unfundedCost + enrichmentFee;

      return {
        day: daysOfWeek[dayIndex],
        sessionType: session.label,
        sessionHours,
        fundedHours: Math.round(fundedHours * 100) / 100,
        unfundedHours: Math.round(unfundedHours * 100) / 100,
        unfundedCost: Math.round(unfundedCost * 100) / 100,
        enrichmentFee: Math.round(enrichmentFee * 100) / 100,
        totalDailyCost: Math.round(totalDailyCost * 100) / 100
      };
    }).filter(day => day !== null);

    const totalWeeklyCost = dailyBreakdown.reduce((sum, day) => sum + day.totalDailyCost, 0);
    const totalUnfundedCost = dailyBreakdown.reduce((sum, day) => sum + day.unfundedCost, 0);
    const totalEnrichmentFees = dailyBreakdown.reduce((sum, day) => sum + day.enrichmentFee, 0);

    setResults({
      dailyBreakdown,
      totalWeeklyCost: Math.round(totalWeeklyCost * 100) / 100,
      totalUnfundedCost: Math.round(totalUnfundedCost * 100) / 100,
      totalEnrichmentFees: Math.round(totalEnrichmentFees * 100) / 100,
      weeklyFundingHours: Math.round(weeklyFundingHours * 100) / 100
    });
  }, [fundingType, fundingPattern, attendanceDays, RATES.hourlyRate, RATES.enrichmentFullyFunded, RATES.enrichmentPartFunded, FUNDING_HOURS, sessionTypes, daysOfWeek]);

  const handleDayChange = (dayIndex, sessionType) => {
    const newAttendanceDays = [...attendanceDays];
    newAttendanceDays[dayIndex] = sessionType;
    setAttendanceDays(newAttendanceDays);
  };

  const removeDayAttendance = (dayIndex) => {
    const newAttendanceDays = [...attendanceDays];
    newAttendanceDays[dayIndex] = null;
    setAttendanceDays(newAttendanceDays);
  };

  useEffect(() => {
    calculateFees();
  }, [calculateFees]);

  return (
    <div className="min-h-screen" style={{backgroundColor: '#d5eeeb'}}>
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="w-full h-auto">
            <img 
              src="/header-image.png" 
              alt="Little Lodge Nursery - Funded Hours Calculator"
              className="w-full h-auto object-cover"
              style={{maxHeight: '200px'}}
            />
          </div>
          
          <div className="px-4 py-4">
            <div className="flex justify-center">
              <a 
                href="mailto:info@littlelodgenursery.com"
                className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                style={{color: '#282829'}}
              >
                <Mail className="w-4 h-4" style={{color: '#73c9bd'}} />
                <span>info@littlelodgenursery.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-8 h-8" style={{color: '#73c9bd'}} />
              <h2 className="text-2xl font-bold" style={{color: '#282829'}}>Calculate Your Fees</h2>
            </div>

            {/* Funding Type Selection */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3" style={{color: '#282829'}}>
                Government Funding Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFundingType('15')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fundingType === '15' ? 'text-white' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={fundingType === '15' ? {
                    borderColor: '#73c9bd',
                    background: 'linear-gradient(135deg, #73c9bd 0%, #64c5b8 100%)'
                  } : {}}
                >
                  <div className="text-xl font-bold">15 Hours</div>
                  <div className={`text-sm ${fundingType === '15' ? 'text-white opacity-90' : 'text-gray-600'}`}>570 hours per year</div>
                </button>
                <button
                  onClick={() => setFundingType('30')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fundingType === '30' ? 'text-white' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={fundingType === '30' ? {
                    borderColor: '#73c9bd',
                    background: 'linear-gradient(135deg, #73c9bd 0%, #64c5b8 100%)'
                  } : {}}
                >
                  <div className="text-xl font-bold">30 Hours</div>
                  <div className={`text-sm ${fundingType === '30' ? 'text-white opacity-90' : 'text-gray-600'}`}>1140 hours per year</div>
                </button>
              </div>
            </div>

            {/* Funding Pattern Selection */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3" style={{color: '#282829'}}>
                How would you like to use your funding?
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setFundingPattern('stretched')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    fundingPattern === 'stretched' ? 'text-white' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={fundingPattern === 'stretched' ? {
                    borderColor: '#73c9bd',
                    background: 'linear-gradient(135deg, #73c9bd 0%, #64c5b8 100%)'
                  } : {}}
                >
                  <div className="font-bold">Stretched Over 51 Weeks</div>
                  <div className={`text-sm ${fundingPattern === 'stretched' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                    {fundingType === '15' ? '11.18' : '22.35'} hours per week throughout the year
                  </div>
                </button>
                <button
                  onClick={() => setFundingPattern('termTime')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    fundingPattern === 'termTime' ? 'text-white' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={fundingPattern === 'termTime' ? {
                    borderColor: '#73c9bd',
                    background: 'linear-gradient(135deg, #73c9bd 0%, #64c5b8 100%)'
                  } : {}}
                >
                  <div className="font-bold">Term Time Only</div>
                  <div className={`text-sm ${fundingPattern === 'termTime' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                    {fundingType} hours per week for 38 weeks (term time only)
                  </div>
                </button>
              </div>
            </div>

            {/* Days Attendance */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3" style={{color: '#282829'}}>
                Select Your Attendance Days
              </label>
              <div className="space-y-3">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="rounded-lg p-4" style={{backgroundColor: '#f1eeed', border: '1px solid #e5e7eb'}}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium" style={{color: '#282829'}}>{day}</span>
                      {attendanceDays[index] && (
                        <button
                          onClick={() => removeDayAttendance(index)}
                          className="text-sm"
                          style={{color: '#f37343'}}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {!attendanceDays[index] ? (
                      <div className="grid grid-cols-1 gap-2">
                        {sessionTypes.map((session) => (
                          <button
                            key={session.value}
                            onClick={() => handleDayChange(index, session.value)}
                            className="text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all"
                          >
                            <div className="font-medium">{session.label}</div>
                            <div className="text-sm text-gray-600">{session.hours} hours</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg" style={{backgroundColor: '#d5eeeb', borderColor: '#73c9bd', border: '1px solid'}}>
                        <div className="font-medium" style={{color: '#282829'}}>
                          {sessionTypes.find(s => s.value === attendanceDays[index])?.label}
                        </div>
                        <div className="text-sm" style={{color: '#73c9bd'}}>
                          {sessionTypes.find(s => s.value === attendanceDays[index])?.hours} hours
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-8 h-8" style={{color: '#e5c83d'}} />
              <h2 className="text-2xl font-bold" style={{color: '#282829'}}>Your Fee Breakdown</h2>
            </div>

            {results ? (
              <div className="space-y-6">
                <div className="text-white p-6 rounded-xl" style={{background: 'linear-gradient(135deg, #73c9bd 0%, #64c5b8 100%)'}}>
                  <h3 className="text-xl font-bold mb-4">Weekly Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm opacity-90">Total Weekly Cost</div>
                      <div className="text-2xl font-bold">£{results.totalWeeklyCost}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-90">Weekly Funding Hours</div>
                      <div className="text-xl font-bold">{results.weeklyFundingHours}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4" style={{color: '#282829'}}>Daily Breakdown</h3>
                  <div className="space-y-4">
                    {results.dailyBreakdown.map((day, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold" style={{color: '#282829'}}>{day.day}</div>
                            <div className="text-sm text-gray-600">{day.sessionType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold" style={{color: '#73c9bd'}}>£{day.totalDailyCost}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Session Hours:</span>
                              <span className="font-medium">{day.sessionHours}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Funded Hours:</span>
                              <span className="font-medium" style={{color: '#73c9bd'}}>{day.fundedHours}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Unfunded Hours:</span>
                              <span className="font-medium">{day.unfundedHours}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>Unfunded Cost:</span>
                              <span className="font-medium">£{day.unfundedCost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resource Fee:</span>
                              <span className="font-medium">£{day.enrichmentFee}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="font-bold">Daily Total:</span>
                              <span className="font-bold">£{day.totalDailyCost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg text-white" style={{backgroundColor: '#73c9bd'}}>
                  <h4 className="font-bold mb-2">Weekly Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Unfunded Hours Cost:</span>
                      <span className="font-medium">£{results.totalUnfundedCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Resource Fees:</span>
                      <span className="font-medium">£{results.totalEnrichmentFees}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Total Weekly Cost:</span>
                      <span>£{results.totalWeeklyCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4" style={{color: '#fbd5c6'}} />
                <h3 className="text-xl font-semibold mb-2" style={{color: '#282829'}}>
                  Select Your Attendance Days
                </h3>
                <p className="text-gray-500">
                  Choose which days your child will attend to see your personalized fee calculation.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <div className="p-4 rounded-lg" style={{backgroundColor: '#fbd5c6', borderColor: '#f37343', border: '1px solid'}}>
            <p className="text-sm" style={{color: '#282829'}}>
              <strong>Please note:</strong> This calculator provides an estimate based on the fee structure effective from 1st September 2025. 
              For specific queries about your invoice, please contact our management team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;