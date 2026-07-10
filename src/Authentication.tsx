import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ArrowLeft, Trophy, Utensils } from "lucide-react";

export default function Authentication() {
  // @ts-ignore
  const user = useQuery(api.users.getMe);

  if (user === undefined) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">Loading...</div>;
  }

  const juniorObj = (user as any)?.juniorCertification;
  const advancedObj = (user as any)?.advancedCertification;
  const mealObj = (user as any)?.mealAllowance;

  const juniorStatus = juniorObj?.status || "unverified";
  const advancedStatus = advancedObj?.status || "unverified";
  const mealStatus = mealObj?.status || "unverified";

  const handleJuniorClick = () => {
    if (juniorStatus !== "verified") {
      window.location.href = "/junior-certification";
    }
  };

  const handleAdvancedClick = () => {
    if (juniorStatus !== "verified") {
      alert("You must pass Junior Certification before submitting Advanced!");
      return;
    }
    if (advancedStatus !== "verified") {
      window.location.href = "/advanced-certification";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#424242] p-5 pb-20">
      <div className="flex items-center mb-10">
        <a href="/profile" className="p-2 -ml-2 rounded-full hover:bg-black/5 transition">
          <ArrowLeft size={24} className="text-[#262626]" />
        </a>
        <h1 className="text-xl font-medium text-center flex-1 pr-8 text-[#262626]">
          authenticate
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* Junior Certification */}
        <div 
          onClick={handleJuniorClick}
          className={`relative rounded-3xl border border-[#3B82F6]/50 bg-white p-6 shadow-sm pt-14 cursor-pointer transition ${juniorStatus === 'verified' ? 'opacity-80' : 'hover:border-[#3B82F6]'}`}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="flex bg-[#CBD5E1] size-[60px] items-center justify-center hexagon shadow-sm">
              <Trophy size={32} className="text-white drop-shadow-md" />
            </div>
          </div>
          
          <h2 className="text-center text-[17px] font-medium text-[#424242] mb-6">junior certification</h2>
          
          <div className={`rounded-xl py-3 text-center text-sm font-medium ${
            juniorStatus === 'verified' ? 'bg-[#3B82F6] text-white' : 
            juniorStatus === 'pending' ? 'bg-[#FCE38A]/50 text-orange-600' : 
            juniorStatus === 'rejected' ? 'bg-red-100 text-red-600' :
            'bg-[#E0E7FF] text-[#2563EB]'
          }`}>
            {juniorStatus}
          </div>
          {juniorStatus === 'rejected' && juniorObj?.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="block text-xs font-bold text-red-600 uppercase mb-1">Reason for Rejection</span>
              <span className="text-sm font-medium text-red-700">{juniorObj.rejectionReason}</span>
            </div>
          )}
        </div>

        {/* Advanced Certification */}
        <div 
          onClick={handleAdvancedClick}
          className={`relative rounded-3xl border border-[#3B82F6]/50 bg-white p-6 shadow-sm pt-14 cursor-pointer transition ${advancedStatus === 'verified' ? 'opacity-80' : 'hover:border-[#3B82F6]'}`}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="flex bg-[#FBBF24] size-[60px] items-center justify-center hexagon shadow-sm">
              <Trophy size={32} className="text-white drop-shadow-md" />
            </div>
          </div>
          
          <h2 className="text-center text-[17px] font-medium text-[#424242] mb-6">advanced certification</h2>
          
          <div className={`rounded-xl py-3 text-center text-sm font-medium ${
            advancedStatus === 'verified' ? 'bg-[#3B82F6] text-white' : 
            advancedStatus === 'pending' ? 'bg-[#FCE38A]/50 text-orange-600' : 
            advancedStatus === 'rejected' ? 'bg-red-100 text-red-600' :
            'bg-[#E0E7FF] text-[#2563EB]'
          }`}>
            {advancedStatus}
          </div>
          {advancedStatus === 'rejected' && advancedObj?.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="block text-xs font-bold text-red-600 uppercase mb-1">Reason for Rejection</span>
              <span className="text-sm font-medium text-red-700">{advancedObj.rejectionReason}</span>
            </div>
          )}
        </div>

        {/* Meal Allowance Reimbursement */}
        <div 
          className="relative rounded-3xl border border-[#3B82F6]/30 bg-white p-6 shadow-sm pt-14 cursor-not-allowed opacity-90"
          title="This section is updated by your administrator."
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
            <div className="flex bg-[#10B981] size-[60px] items-center justify-center hexagon shadow-sm">
              <Utensils size={28} className="text-white drop-shadow-md" />
            </div>
          </div>
          
          <h2 className="text-center text-[17px] font-medium text-[#424242] mb-6">meal allowance reimbursement</h2>
          
          <div className={`rounded-xl py-3 text-center text-sm font-medium ${
            mealStatus === 'verified' ? 'bg-[#10B981] text-white' : 
            mealStatus === 'pending' ? 'bg-[#FCE38A]/50 text-orange-600' : 
            mealStatus === 'rejected' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {mealStatus}
          </div>
          {mealStatus === 'rejected' && mealObj?.rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="block text-xs font-bold text-red-600 uppercase mb-1">Reason for Rejection</span>
              <span className="text-sm font-medium text-red-700">{mealObj.rejectionReason}</span>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </div>
  );
}
