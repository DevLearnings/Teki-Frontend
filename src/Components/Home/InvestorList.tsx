import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

interface Investor {
  id: string;
  name: string;
  company: string;
  investmentRange: string;
  interests: string[];
  lastContact: Date;
}

const mockInvestors: Investor[] = [
  { id: '1', name: 'John Doe', company: 'Tech Ventures', investmentRange: '$100k - $500k', interests: ['AI', 'Blockchain'], lastContact: new Date('2023-06-15') },
  { id: '2', name: 'Jane Smith', company: 'Green Investments', investmentRange: '$500k - $1M', interests: ['Clean Energy', 'Sustainability'], lastContact: new Date('2023-06-10') },
  { id: '3', name: 'Bob Johnson', company: 'Health Capital', investmentRange: '$1M - $5M', interests: ['Healthcare', 'Biotech'], lastContact: new Date('2023-06-05') },
  { id: '4', name: 'Alice Brown', company: 'Future Fund', investmentRange: '$100k - $500k', interests: ['EdTech', 'SaaS'], lastContact: new Date('2023-06-01') },
  { id: '5', name: 'Charlie White', company: 'Innovation Invest', investmentRange: '$5M+', interests: ['SpaceTech', 'Robotics'], lastContact: new Date('2023-05-28') },
];

const InvestorList: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>(mockInvestors);
  const [sortKey, setSortKey] = useState<keyof Investor>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterInterest, setFilterInterest] = useState<string>('');

  const sortedInvestors = useMemo(() => {
    let result = [...investors];
    if (filterInterest) {
      result = result.filter(investor => investor.interests.includes(filterInterest));
    }
    return result.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [investors, sortKey, sortOrder, filterInterest]);

  const handleSort = (key: keyof Investor) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const allInterests = useMemo(() => {
    const interests = new Set<string>();
    investors.forEach(investor => investor.interests.forEach(interest => interests.add(interest)));
    return Array.from(interests);
  }, [investors]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Investor List</h2>
        <div className="flex items-center space-x-4">
          <label className="text-gray-600">Filter by interest:</label>
          <select
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {allInterests.map(interest => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('name')}>
                Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('company')}>
                Company {sortKey === 'company' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 text-left">Investment Range</th>
              <th className="px-4 py-2 text-left">Interests</th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => handleSort('lastContact')}>
                Last Contact {sortKey === 'lastContact' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedInvestors.map((investor) => (
              <tr key={investor.id} className="border-b">
                <td className="px-4 py-2">{investor.name}</td>
                <td className="px-4 py-2">{investor.company}</td>
                <td className="px-4 py-2">{investor.investmentRange}</td>
                <td className="px-4 py-2">
                  {investor.interests.map((interest, index) => (
                    <span key={interest} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                      {interest}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2">{investor.lastContact.toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <Link to={`/investor/${investor.id}`} className="text-indigo-600 hover:text-indigo-800">
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedInvestors.length === 0 && (
        <p className="text-center text-gray-600">No investors found matching the current filter.</p>
      )}
    </div>
  );
};

export default InvestorList;