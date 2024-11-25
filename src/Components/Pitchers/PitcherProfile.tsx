import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TekiContext } from '../../App';

interface Pitcher {
  name: string;
  age: number;
  email: string;
  team: string;
  position: string;
  throws: string;
  // Add more properties as needed
}

const PitcherProfile: React.FC = () => {
  const { pitcherId } = useParams<{ pitcherId: string }>();
  const { BASE, loading, setLoading, thePitcher, setThePitcher } = useContext(TekiContext);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPitcher = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE}/pitchers/findme/${pitcherId}`);
        if (!response.ok) {
          throw new Error('Pitcher not found');
        }
        const data: Pitcher = await response.json();
        setThePitcher(data);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPitcher();
  }, [BASE, pitcherId, setLoading, setThePitcher]);

  if (loading) {
    return <h1 style={{ margin: "40px" }}>Loading...</h1>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!thePitcher) {
    return <div>Pitcher not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ margin: "40px" }}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-4">{thePitcher.name}</h2>
        <p className="text-gray-700 mb-2">Age: {thePitcher.age}</p>
        <p className="text-gray-700 mb-2">Email: {thePitcher.email}</p>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Pitcher Details</h3>
          <p className="text-gray-700 mb-2"><span className="font-semibold">Team:</span> {thePitcher.team}</p>
          <p className="text-gray-700 mb-2"><span className="font-semibold">Position:</span> {thePitcher.position}</p>
          <p className="text-gray-700 mb-2"><span className="font-semibold">Throws:</span> {thePitcher.throws}</p>
          {/* Add more pitcher details as needed */}
        </div>
        <div className="mt-4">
          <Link
            to={`/pitchers/${pitcherId}/stats`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Pitcher Stats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PitcherProfile;
