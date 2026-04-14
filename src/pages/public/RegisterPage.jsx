import RegisterUserComponent from "@/components/users/RegisterUserComponent";

export default function RegisterPage() {
  return (
    <div className="w-full flex items-center justify-center py-16 px-4">
      {/* Register Container Card */}
      <div className="max-w-2xl w-full bg-white border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-10 md:p-16 bg-white flex flex-col justify-center">
          <RegisterUserComponent />
        </div>
      </div>
    </div>
  );
}
