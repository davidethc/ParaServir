import { useState, type FormEvent } from "react";
import { useVerifyCode } from "../hooks/useVerifyCode";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface VerifyCodeFormProps {
  className?: string;
}

export function VerifyCodeForm({ className }: VerifyCodeFormProps) {
  const { verify, resendCode, isLoading, error, success } = useVerifyCode();
  const [formData, setFormData] = useState({
    code: "7789BM6X",
  });
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verify(formData.code);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResend = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await resendCode();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Code
        </label>
        <div className="relative">
          <input
            id="code"
            name="code"
            type={showCode ? "text" : "password"}
            required
            value={formData.code}
            onChange={handleChange}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="7789BM6X"
          />
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showCode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.29 3.29L12 12m-3.59-3.59L12 12m0 0l3.59 3.59M12 12l3.59-3.59m0 0a9.953 9.953 0 013.7-2.611m-3.7 2.611L12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Didn't receive a code?{" "}
        <a
          href="#"
          onClick={handleResend}
          className="text-red-600 hover:text-red-700 hover:underline"
        >
          Resend
        </a>
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">¡Código verificado! Redirigiendo...</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Verificando..." : "Verify"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link to="/login" className="text-gray-600 hover:underline">
          &lt; Back to login
        </Link>
      </p>
    </form>
  );
}

