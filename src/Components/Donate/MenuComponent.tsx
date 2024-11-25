// MenuComponent.tsx
import React, { useState } from "react";

interface MenuComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (campaignData: CampaignData) => void;
}

interface CampaignData {
  title: string;
  description: string;
  targetAmount: string;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ isOpen, onClose, onCreateCampaign }) => {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: "",
    description: "",
    targetAmount: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreateCampaign(campaignData);
    setCampaignData({
      title: "",
      description: "",
      targetAmount: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full sm:max-w-lg">
        <div className="p-6">
          {/* Example menu items */}
          <ul className="space-y-4">
            <li className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">Menu Item 1</li>
            <li className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">Menu Item 2</li>
            <li className="cursor-pointer hover:bg-gray-100 p-2 rounded-md">Menu Item 3</li>
          </ul>
          {/* Campaign creation form */}
          <form onSubmit={handleCreateCampaign} className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Create New Campaign</h2>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={campaignData.title}
                onChange={handleChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={campaignData.description}
                onChange={handleChange}
                rows={4}
                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md resize-none"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                Target Amount ($)
              </label>
              <input
                type="number"
                id="targetAmount"
                name="targetAmount"
                value={campaignData.targetAmount}
                onChange={handleChange}
                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            >
              Create Campaign
            </button>
          </form>
        </div>
        {/* Close button */}
        <button
          className="absolute top-0 right-0 m-4 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MenuComponent;
