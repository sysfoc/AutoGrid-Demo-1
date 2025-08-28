"use client";
import type React from "react";
import { useState, useMemo } from "react";
import { Calculator, Car, Percent, X } from "lucide-react";
import { SiCashapp } from "react-icons/si";

const VehicleFinanceCalculator = () => {
  const [carPrice, setCarPrice] = useState<number>(0);
  const [carYear, setCarYear] = useState<string>("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState<number>(5);
  const [carPriceError, setCarPriceError] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");
  const [repaymentFrequency, setRepaymentFrequency] =
    useState<string>("monthly");
  const [hasEndOfLoanRepayment, setHasEndOfLoanRepayment] =
    useState<boolean>(false);
  const [endOfLoanPercentage, setEndOfLoanPercentage] = useState<number>(0);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateCarPrice = (price: number) => {
    if (price < 2000) {
      setCarPriceError("Car price cannot be less than $2,000");
    } else if (price > 1000000) {
      setCarPriceError("Car price cannot be greater than $1,000,000");
    } else {
      setCarPriceError("");
    }
  };

  const validateDeposit = (deposit: number, carPrice: number) => {
    if (deposit > carPrice) {
      setDepositError("Deposit cannot be greater than car price");
    } else {
      setDepositError("");
    }
  };

  const getInterestRates = (year: string | number, loanAmount: number) => {
    const yearNum =
      Number.parseInt(year.toString()) || new Date().getFullYear();

    if (loanAmount <= 5000) {
      return { interestRate: 8.49, comparisonRate: 9.19 };
    }

    if (yearNum >= 2024) {
      return { interestRate: 6.99, comparisonRate: 7.69 }; // up to 1 million
    } else if (yearNum >= 2020) {
      if (loanAmount <= 100000) {
        return { interestRate: 7.49, comparisonRate: 8.19 }; // Best rate option for this period
      }
      return { interestRate: 7.49, comparisonRate: 8.19 };
    } else if (yearNum >= 2013) {
      if (loanAmount <= 100000) {
        return { interestRate: 7.49, comparisonRate: 8.19 }; // Best rate option for this period
      }
      return { interestRate: 7.49, comparisonRate: 8.19 };
    } else {
      // 2000-2012: only one rate tier
      return { interestRate: 8.49, comparisonRate: 9.19 };
    }
  };

  const calculations = useMemo(() => {
    const loanAmount = carPrice - depositAmount;
    const rates = getInterestRates(carYear, loanAmount);
    const interestRate = rates.interestRate;
    const comparisonRate = rates.comparisonRate;

    // Calculate balloon payment (based on car price)
    const balloonAmount = hasEndOfLoanRepayment
      ? (carPrice * endOfLoanPercentage) / 100
      : 0;

    const annualRate = interestRate / 100;
    let periodsPerYear;

    switch (repaymentFrequency) {
      case "weekly":
        periodsPerYear = 52;
        break;
      case "fortnightly":
        periodsPerYear = 26;
        break;
      default:
        periodsPerYear = 12;
    }

    const totalPeriods = loanTerm * periodsPerYear;
    const periodicRate = annualRate / periodsPerYear;

    let periodicPayment = 0;

    if (loanAmount > 0 && periodicRate > 0 && totalPeriods > 0) {
      // Standard payment calculation on full loan amount
      periodicPayment =
        (loanAmount * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
        (Math.pow(1 + periodicRate, totalPeriods) - 1);
    }

    const totalRegularPayments = periodicPayment * totalPeriods;
    const totalInterest = totalRegularPayments + balloonAmount - loanAmount;
    const totalCostOfLoan = loanAmount + totalInterest;

    return {
      loanAmount,
      interestRate,
      comparisonRate,
      periodicPayment,
      totalInterest,
      endOfLoanAmount: balloonAmount,
      totalCostOfLoan,
    };
  }, [
    carPrice,
    depositAmount,
    loanTerm,
    repaymentFrequency,
    hasEndOfLoanRepayment,
    endOfLoanPercentage,
    carYear,
  ]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFrequencyLabel = () => {
    switch (repaymentFrequency) {
      case "weekly":
        return "Weekly";
      case "fortnightly":
        return "Fortnightly";
      default:
        return "Monthly";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/save-rate-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          calculationData: {
            carPrice,
            carYear,
            depositAmount,
            loanTerm,
            repaymentFrequency,
            hasEndOfLoanRepayment,
            endOfLoanPercentage,
            ...calculations,
          },
        }),
      });

      if (response.ok) {
        alert("Your rate request has been submitted successfully!");
        setShowModal(false);
        setFormData({ name: "", email: "", mobile: "" });
      } else {
        alert("There was an error submitting your request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 dark:from-gray-900 dark:to-gray-800">
      <style>
      {`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}
    </style>
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 shadow-lg dark:bg-gray-800 dark:shadow-gray-900/30">
            <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Vehicle Finance Calculator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Calculate your car loan repayments with our comprehensive finance
            calculator
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-gray-900/30">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
              <Car className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Vehicle & Loan Details
            </h3>

            <div className="space-y-6">
              {/* Car Year */}
             {/* Car Year */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
    Car Year *
  </label>
  <select
    value={carYear}
    onChange={(e) => setCarYear(e.target.value)}
    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
  >
    <option value="">Select car year</option>
    {Array.from({ length: 26 }, (_, i) => 2025 - i).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>

              {/* Car Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Car Price ($) *
                </label>
                <input
                  type="number"
                  value={carPrice || ""}
                  onChange={(e) => {
                    const price = Number.parseFloat(e.target.value) || 0;
                    setCarPrice(price);
                    validateCarPrice(price);
                    validateDeposit(depositAmount, price); // Re-validate deposit
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                  placeholder="Enter car price"
                  min="0"
                  step="0.01"
                />
                {carPriceError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {carPriceError}
                  </p>
                )}
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Deposit Amount ($)
                </label>
                <input
                  type="number"
                  value={depositAmount || ""}
                  onChange={(e) => {
                    const deposit = Number.parseFloat(e.target.value) || 0;
                    setDepositAmount(deposit);
                    validateDeposit(deposit, carPrice);
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                  placeholder="Enter deposit amount"
                  min="0"
                  step="0.01"
                />
                {depositError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {depositError}
                  </p>
                )}
              </div>

              {/* Loan Term */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Term (Years)
                </label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number.parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((year) => (
                    <option key={year} value={year}>
                      {year} year{year > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Repayment Frequency */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Repayments
                </label>
                <select
                  value={repaymentFrequency}
                  onChange={(e) => setRepaymentFrequency(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                >
                  <option value="monthly">Monthly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* End of Loan Repayment Checkbox */}
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={hasEndOfLoanRepayment}
                    onChange={(e) => setHasEndOfLoanRepayment(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-purple-400"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Add end of loan repayment
                  </span>
                </label>
              </div>

              {/* End of Loan Repayment Dropdown */}
              {hasEndOfLoanRepayment && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End of loan repayment
                  </label>
                  <select
                    value={endOfLoanPercentage}
                    onChange={(e) =>
                      setEndOfLoanPercentage(Number.parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                  >
                    {Array.from({ length: 11 }, (_, i) => i * 5).map(
                      (percent) => (
                        <option key={percent} value={percent}>
                          {percent}%
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-gray-900/30">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
              <Calculator className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Loan Calculation Results
            </h3>

            <div className="space-y-6">
              {/* Estimated Repayments */}
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
                <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
                  Estimated {getFrequencyLabel()} Repayments
                </h4>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(calculations.periodicPayment)}
                </p>
              </div>

              {/* Interest Rates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div className="mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Interest Rate
                    </h4>
                  </div>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
                    {calculations.interestRate}%
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div className="mb-2 flex items-center gap-2">
                    <Percent className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      Comparison Rate
                    </h4>
                  </div>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-300">
                    {calculations.comparisonRate}%
                  </p>
                </div>
              </div>

              {/* Loan Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-600">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Calculated Loan Amount
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculations.loanAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-600">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Estimated Interest
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculations.totalInterest)}
                  </span>
                </div>

                {hasEndOfLoanRepayment && calculations.endOfLoanAmount > 0 && (
                  <div className="flex items-center justify-between border-b border-gray-200 py-2 dark:border-gray-600">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Estimated End of Loan Repayment
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(calculations.endOfLoanAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-900/30">
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    Estimated Cost of Loan
                  </span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(calculations.totalCostOfLoan)}
                  </span>
                </div>

                <div className="mt-8 rounded-xl border-2 border-purple-600 bg-white p-6 text-purple-600 dark:border-purple-400 dark:bg-gray-800 dark:text-purple-400">
                  <p className="text-center text-sm">
                    <strong>Disclaimer:</strong> This calculator provides
                    estimates only. Actual loan terms, interest rates, and
                    repayment amounts may vary based on credit assessment,
                    lender policies, and current market conditions. Please
                    consult with a financial advisor or lender for accurate loan
                    terms and conditions.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1 rounded-3xl bg-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  >
                    Get a Rate
                    <SiCashapp />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for rate request form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 dark:bg-black dark:bg-opacity-75">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-gray-800 dark:shadow-gray-900/50">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Get Your Rate
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-purple-400"
                    placeholder="Enter your mobile number"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-purple-500 dark:hover:bg-purple-600"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleFinanceCalculator;
