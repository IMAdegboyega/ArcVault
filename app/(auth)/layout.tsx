import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen w-full font-inter">
      {/* Form side */}
      <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-10 bg-white">
        {children}
      </div>
      {/* Illustration side */}
      <div className="sticky top-0 hidden h-screen w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 lg:flex">
        <div className="relative flex flex-col items-center gap-6 px-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-200">
            <Image src="/icons/logo.svg" width={32} height={32} alt="ArcVault" className="brightness-0 invert" />
          </div>
          <h2 className="text-center font-ibm-plex-serif text-3xl font-bold text-gray-900">
            Your money,<br />your control.
          </h2>
          <p className="max-w-[340px] text-center text-base text-gray-500">
            ArcVault gives you a unified view of all your bank accounts, transactions, and transfers in one secure place.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-2 w-8 rounded-full bg-blue-600" />
            <div className="flex h-2 w-2 rounded-full bg-blue-200" />
            <div className="flex h-2 w-2 rounded-full bg-blue-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
