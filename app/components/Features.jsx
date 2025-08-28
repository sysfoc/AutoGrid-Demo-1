import { IoSpeedometerOutline } from "react-icons/io5";
import { GiGasPump, GiMagicLamp } from "react-icons/gi";
import { PiGasCanLight } from "react-icons/pi";
import { GrMapLocation } from "react-icons/gr";
import { TbManualGearbox } from "react-icons/tb";
import { BsFillBookmarkFill } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { MapPin, Phone, FileText, Building } from "lucide-react";

const Features = ({ loadingState, carData, car, translation: t }) => {
  const loading = loadingState;

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const featureChunks = chunkArray(car?.features || [], 2);

  const keyStats = [
    { icon: <IoSpeedometerOutline className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Mileage", value: car?.kms, unit: "Kms" },
    { icon: <PiGasCanLight className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Fuel Type", value: car?.fuelType, unit: "" },
    { icon: <GiGasPump className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Tank Fill", value: car?.fuelTankFillPrice, unit: "To Fill" },
    { icon: <GrMapLocation className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Average", value: car?.fuelCapacityPerTank, unit: "Per Tank" },
    { icon: <TbManualGearbox className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Transmission", value: car?.noOfGears, unit: "Gears" },
    { icon: <GiMagicLamp className="h-5 w-5 text-purple-600 dark:text-purple-400" />, label: "Engine", value: car?.cylinder, unit: "Cylinder" },
  ];

  const dealerInfo = [
    { label: "Location", value: carData?.address, icon: MapPin },
    { label: "Contact", value: carData?.contact, icon: Phone },
    { label: "Licence", value: carData?.licence, icon: FileText },
    { label: "ABN", value: carData?.abn, icon: Building },
  ];

  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {keyStats.map((stat, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                {loading ? <Skeleton width={50} /> : stat.value || "N/A"}{" "}
                <span className="text-xs font-normal text-gray-600 dark:text-gray-400">{stat.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Features */}
      {car?.features && car.features.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-purple-600 rounded-md">
            <BsFillBookmarkFill className="h-5 w-5 text-white" />
            <h3 className="text-sm font-semibold text-white">{t("vehicalFeatures")}</h3>
          </div>

          <div className="space-y-2">
            {featureChunks.map((chunk, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chunk.map((feature, colIndex) => (
                  <div key={colIndex} className="flex items-center gap-2 p-2 border rounded-md">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30">
                      <svg className="h-3 w-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {loading ? <Skeleton width={100} /> : feature}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dealer Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-purple-600 rounded-md">
          <MdLocationOn className="h-5 w-5 text-white" />
          <h3 className="text-sm font-semibold text-white">{t("findUs")}</h3>
        </div>

        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700" />
                  <Skeleton width={60} height={16} />
                </div>
                <Skeleton width={100} height={16} />
              </div>
            ))
          ) : carData ? (
            dealerInfo.map((info, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-100 dark:bg-purple-900/30">
                    <info.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{info.label}</span>
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {info.value || "Not provided"}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 border rounded-md text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No dealer information available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Features;
