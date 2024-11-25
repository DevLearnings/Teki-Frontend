import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Epilogue, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-slate-50 @[480px]:rounded-xl min-h-[218px]"
                  style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/2766f09b-8571-46cd-838a-069b61d18721.png")' }}
                ></div>
              </div>
            </div>
            <h1 className="text-[#0e141b] tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">404 Not Found</h1>
            <p className="text-[#0e141b] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">Sorry, the page you are looking for does not exist.</p>
            <div className="flex px-4 py-3 justify-center">
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#e7edf3] text-[#0e141b] text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <Link to={"/"}> <span className="truncate">Go Back Home</span></Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
