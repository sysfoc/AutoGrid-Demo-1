"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Sun, Moon, Search, Menu, X, ChevronDown } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import Image from "next/image";

const CACHE_KEY = "homepage_data";
const CACHE_DURATION = 300000;
const CacheManager = {
  get: (key) => {
    try {
      if (typeof window === "undefined") return null;
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      if (now - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (error) {
      console.warn("Cache retrieval failed:", error);
      return null;
    }
  },

  set: (key, data) => {
    try {
      if (typeof window === "undefined") return;
      const cacheData = { data, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn("Cache storage failed:", error);
    }
  },

  clear: (key) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Cache clear failed:", error);
    }
  },
};

const apiClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  },
});

const HeroSection = () => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const [imageCached, setImageCached] = useState(false);
  const [homepageData, setHomepageData] = useState(null);
  const [logo, setLogo] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [topSettings, setTopSettings] = useState({
    hideDarkMode: false,
    hideFavourite: false,
    hideLogo: false,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [listingsDropdownOpen, setListingsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const mountedRef = useRef(true);
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const [carSearchData, setCarSearchData] = useState(null);
  const [carSearchLoading, setCarSearchLoading] = useState(false);
  const [carSearchMakes, setCarSearchMakes] = useState([]);
  const [carSearchModels, setCarSearchModels] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const idPrefix = useRef(Date.now().toString(36)).current;

  const heroImage = "/autogrid.avif";

  const handleLogoError = useCallback(() => {
    setLogoError(true);
    setLogo("");
  }, []);

  const navigateToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const navigateToLikedCars = useCallback(() => {
    router.push("/liked-cars");
  }, [router]);

  const handleMobileMenuOpen = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const fetchCarSearchData = useCallback(async () => {
    try {
      setCarSearchLoading(true);
      const response = await fetch("/Vehicle make and model data (2).json");
      const data = await response.json();
      setCarSearchData(data.Sheet1);
      const uniqueMakes = [...new Set(data.Sheet1.map((item) => item.Maker))];
      setCarSearchMakes(uniqueMakes);
    } catch (error) {
      console.error("Error loading vehicle data:", error);
    } finally {
      setCarSearchLoading(false);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    // Persist preference
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");

    // Apply immediately
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const preloadAndCacheImage = useCallback(async (src) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        setImageCached(true);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.crossOrigin = "anonymous";
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        // Check cache first
        const cachedData = CacheManager.get(CACHE_KEY);
        if (cachedData) {
          setHomepageData(cachedData);
          return;
        }

        // Fetch from API if no cache
        const response = await apiClient.get("/api/homepage");
        CacheManager.set(CACHE_KEY, response.data);
        setHomepageData(response.data);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      }
    };
    fetchHomepageData();
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const cachedData = CacheManager.get("header_settings");
        if (cachedData?.settings?.logo1) {
          setLogo(cachedData.settings.logo1);
          return;
        }
        const response = await fetch("/api/settings/general");
        const data = await response.json();
        CacheManager.set("header_settings", data);
        setLogo(data?.settings?.logo1 || "");
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    if (selectedMake && carSearchData) {
      const makeData = carSearchData.find(
        (item) => item.Maker === selectedMake,
      );
      if (makeData && makeData["model "]) {
        const modelArray = makeData["model "]
          .split(",")
          .map((model) => model.trim());
        setCarSearchModels(modelArray);
      } else {
        setCarSearchModels([]);
      }
      setSelectedModel("");
    }
  }, [selectedMake, carSearchData]);

  const navLinkClasses =
    "text-black px-5 py-2 rounded-xl font-semibold hover:text-white hover:bg-purple-600 dark:hover:bg-purple-700 dark:text-white transition-colors";

  const handleCarSearch = useCallback(async () => {
    if (!selectedMake && !maxPrice && !location) {
      alert("Please select at least one search criterion.");
      return;
    }

    try {
      const queryParams = [];
      if (selectedMake)
        queryParams.push(`make=${encodeURIComponent(selectedMake)}`);
      if (selectedModel)
        queryParams.push(`model=${encodeURIComponent(selectedModel)}`);
      if (maxPrice) queryParams.push(`maxPrice=${maxPrice}`);
      if (location)
        queryParams.push(`location=${encodeURIComponent(location)}`);
      if (selectedCondition !== "all")
        queryParams.push(`condition=${encodeURIComponent(selectedCondition)}`);

      const queryString = queryParams.join("&");
      router.push(`/car-for-sale?${queryString}`);
    } catch (error) {
      console.error("Error searching cars:", error);
      alert("An error occurred. Please try again.");
    }
  }, [
    selectedMake,
    selectedModel,
    maxPrice,
    location,
    selectedCondition,
    router,
  ]);

  useEffect(() => {
    fetchCarSearchData();
  }, [fetchCarSearchData]);

  const ConditionTab = ({ condition, label, selected, onClick }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        console.log(`Clicking ${condition} tab`);
        onClick();
      }}
      className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
        selected
          ? "bg-white text-purple-600 shadow-md"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={handleMobileMenuClose}
        >
          <div className="fixed left-0 top-0 h-full w-80 transform bg-white transition-transform duration-300 dark:bg-gray-800">
            <div className="p-6">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {logo && !logoError ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                      <Image
                        src={logo || "/placeholder.svg"}
                        alt="Logo"
                        fill
                        className="object-contain"
                        onError={handleLogoError}
                        priority
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-purple-600"></div>
                  )}
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    AutoGrid
                  </span>
                </div>
                <button onClick={handleMobileMenuClose} className="p-2">
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  href="/car-for-sale"
                  className="block py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                >
                  Listings
                </Link>
                <Link
                  href="/cars/valuation"
                  className="block py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                >
                  Car valuation
                </Link>
                <Link
                  href="/car-financing"
                  className="block py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                >
                  Car financing
                </Link>
                <Link
                  href="/cars/about-us"
                  className="block py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                >
                  Vehicle Services
                </Link>
              </div>

              <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                <button
                  onClick={navigateToLogin}
                  className="mb-4 w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Sign Up
                </button>
                <div className="flex space-x-2">
                  {!topSettings.hideFavourite && (
                    <button
                      onClick={navigateToLikedCars}
                      className="flex-1 rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <Heart className="mx-auto h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                  {!topSettings.hideDarkMode && (
                    <button
                      onClick={toggleDarkMode}
                      className="flex-1 rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      {darkMode ? (
                        <Sun className="mx-auto h-4 w-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Moon className="mx-auto h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl">
        {/* Header Navigation */}
        <header className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              {logo && !logoError ? (
                <div className="relative h-14 w-16 overflow-hidden rounded-lg">
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt="Logo"
                    fill
                    className="object-contain"
                    onError={handleLogoError}
                    priority
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-white/20"></div>
              )}
              <span className="text-xl font-bold text-black dark:text-white">
                AutoGrid
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 rounded-2xl lg:flex">
              <Link href="/car-for-sale" className={navLinkClasses}>
                Listings
              </Link>
              <Link href="/cars/valuation" className={navLinkClasses}>
                Car Valuation
              </Link>
              <Link href="/car-financing" className={navLinkClasses}>
                Car Financing
              </Link>
              <Link href="/cars/about-us" className={navLinkClasses}>
                Vehicle Services
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden items-center space-x-2 lg:flex">
                {!topSettings.hideFavourite && (
                  <button
                    onClick={navigateToLikedCars}
                    className="rounded-lg p-2 text-black transition-colors hover:bg-purple-600 hover:text-white dark:text-white"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                )}
                {!topSettings.hideDarkMode && (
                  <button
                    onClick={toggleDarkMode}
                    className="rounded-lg p-2 text-black transition-colors hover:bg-purple-600  hover:text-white dark:text-white"
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              <button
                onClick={navigateToLogin}
                className="hidden items-center rounded-lg border-2 border-purple-600 bg-white px-4 py-2 font-medium text-purple-600 transition-colors hover:bg-purple-600 hover:text-white lg:flex"
              >
                Sign Up
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={handleMobileMenuOpen}
                className="rounded-lg p-2 text-black hover:bg-white/10 dark:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="px-6">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-800">
            {/* Hero Content */}
            <div className="relative bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-700 dark:to-purple-900">
              <div className="relative px-8 py-16 lg:px-16 lg:py-20">
                <div className="flex items-center justify-between">
                  <div className="max-w-2xl">
                    <h1 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl">
                      {homepageData?.searchSection?.mainHeading || ""}
                    </h1>

                    {/* Search Form */}
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                      {/* Condition Tabs */}
                      <div className="mb-6 flex space-x-2">
                        <ConditionTab
                          condition="all"
                          label="All Cars"
                          selected={selectedCondition === "all"}
                          onClick={() => setSelectedCondition("all")}
                        />
                        <ConditionTab
                          condition="new"
                          label="New Cars"
                          selected={selectedCondition === "new"}
                          onClick={() => setSelectedCondition("new")}
                        />
                        <ConditionTab
                          condition="used"
                          label="Used Cars"
                          selected={selectedCondition === "used"}
                          onClick={() => setSelectedCondition("used")}
                        />
                      </div>

                      {/* Search Fields */}
                      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative">
                          <select
                            value={selectedMake}
                            onChange={(e) => setSelectedMake(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-white/30 bg-white/90 px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-white"
                            disabled={carSearchLoading}
                          >
                            <option value="">Select Make</option>
                            {carSearchMakes.map((make, index) => (
                              <option key={index} value={make}>
                                {make}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                        </div>

                        <div className="relative">
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-white/30 bg-white/90 px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-white disabled:opacity-50"
                            disabled={!selectedMake || carSearchLoading}
                          >
                            <option value="">Select Model</option>
                            {carSearchModels.map((model, index) => (
                              <option key={index} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-lg border border-white/30 bg-white/90 px-4 py-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-white"
                          />
                        </div>

                        <div>
                          <input
                            type="number"
                            placeholder="Max price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full rounded-lg border border-white/30 bg-white/90 px-4 py-3 text-gray-900 [-moz-appearance:textfield] focus:border-transparent focus:ring-2 focus:ring-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>

                      {/* Search Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-white/80">
                          <span className="text-sm">
                            Featured & promoted Vehicles for your consideration 
                          </span>
                        </div>

                        <button
                          onClick={handleCarSearch}
                          className="flex items-center space-x-2 rounded-lg bg-purple-500 px-8 py-3 font-medium text-white transition-colors hover:bg-purple-600"
                        >
                          <Search className="h-4 w-4" />
                          <span>Search</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="relative left-16 top-7 hidden lg:block">
                    <Image
                      src="/00085.png"
                      alt="Car"
                      width={500}
                      height={500}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
