// laptop-review/app/compare/[...slugs]/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { laptopService } from "@/services/firebaseServices"
import Header from "@/components/common/header"
import Footer from "@/components/common/footer"
import RatingBar from "@/components/common/rating-bar"
import ComparisonOverview from "@/components/comparison/ComparisonOverview"
import ImportanceAdjuster from "@/components/comparison/ImportanceAdjuster"
import KeyDifferences from "@/components/comparison/KeyDifferences"
import ComparisonTable from "@/components/comparison/ComparisonTable"
import { getKeyDifferences } from "@/utils/compareUtils"
import BatteryComparisonChart from "@/components/comparison/BatteryComparisonChart"
import PerformanceComparisonChart from "@/components/comparison/PerformanceComparisonChart"


interface ComparisonWeights {
  performance: number
  gaming: number
  display: number
  battery: number
  connectivity: number
  portability: number
}

export default function ComparisonPage() {
  const params = useParams()
  const [laptops, setLaptops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weights, setWeights] = useState<ComparisonWeights>({
    performance: 1,
    gaming: 1,
    display: 1,
    battery: 1,
    connectivity: 1,
    portability: 1,
  })

  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        if (params.slugs) {
          // Lấy chuỗi cuối cùng từ mảng slugs và tách nó bằng '-vs-'
          const compareString = params.slugs[params.slugs.length - 1]
          const ids = compareString.split("-vs-")
          
          if (ids.length === 2) {
            // Sử dụng Promise.all để fetch cả hai laptop cùng lúc
            const laptopPromises = ids.map(id => laptopService.getById(id));
            const laptopData = await Promise.all(laptopPromises);
            
            // Lọc ra các laptop tồn tại (không null)
            const validLaptops = laptopData.filter(laptop => laptop !== null);
            
            if (validLaptops.length === 2) {
              setLaptops(validLaptops);
            } else {
              setError("Không thể tìm thấy một hoặc cả hai laptop để so sánh");
            }
          } else {
            setError("URL không đúng định dạng");
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu laptop:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu laptop");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLaptops();
  }, [params]);

  const keyDifferences = useMemo(() => {
    if (laptops.length < 2) return { laptop1: [], laptop2: [] };
    return getKeyDifferences(laptops);
  }, [laptops]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl font-medium dark:text-white">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || laptops.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4 dark:text-white">Unable to Compare Laptops</h1>
            <p className="mb-4 dark:text-gray-300">Please make sure you're using the correct URL format:</p>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded mb-4 dark:text-gray-300">/compare/laptop-id-1-vs-laptop-id-2</code>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
              Return to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Specs configuration for comparison tables
  const caseSpecs = [
    { label: "Weight", path: "detailedSpecs.case.weight", isHigherBetter: false },
    { label: "Screen-to-Body Ratio", path: "detailedSpecs.case.screenToBodyRatio" },
  ];

  const displaySpecs = [
    { label: "Resolution", path: "detailedSpecs.display.resolution" },
    { label: "Refresh Rate", path: "detailedSpecs.display.refreshRate" },
    { label: "Brightness", path: "detailedSpecs.display.brightness" },
    { label: "Color Gamut (sRGB)", path: "detailedSpecs.display.colorGamut.sRGB" },
  ];

  const performanceSpecs = [
    { label: "Geekbench 6 (Single)", path: "detailedSpecs.cpu.benchmarks.geekbench6Single" },
    { label: "Geekbench 6 (Multi)", path: "detailedSpecs.cpu.benchmarks.geekbench6Multi" },
    { label: "3D Mark Wildlife Extreme", path: "detailedSpecs.gpu.benchmarks.wildlifeExtreme" },
  ];

  const batterySpecs = [
    { label: "Capacity", path: "detailedSpecs.battery.capacity" },
    { label: "Fast Charging", path: "detailedSpecs.battery.fastCharging" },
  ];

  const connectivitySpecs = [
    { label: "Wi-Fi", path: "detailedSpecs.connectivity.wifi" },
    { label: "Bluetooth", path: "detailedSpecs.connectivity.bluetooth" },
    { label: "USB-A Ports", path: "detailedSpecs.connectivity.ports.usba" },
    { label: "USB-C Ports", path: "detailedSpecs.connectivity.ports.usbc" },
    { label: "Thunderbolt", path: "detailedSpecs.connectivity.ports.thunderbolt" },
    { label: "HDMI", path: "detailedSpecs.connectivity.ports.hdmi" },
    { label: "SD Card Reader", path: "detailedSpecs.connectivity.ports.sdCard" },
    { label: "Webcam", path: "detailedSpecs.connectivity.webcam" },
  ];

  const inputSpecs = [
    { label: "Keyboard", path: "detailedSpecs.input.keyboard" },
    { label: "Numpad", path: "detailedSpecs.input.numpad" },
    { label: "Key Travel", path: "detailedSpecs.input.keyTravel" },
    { label: "Touchpad Size", path: "detailedSpecs.input.touchpad.size" },
    { label: "Touchpad Surface", path: "detailedSpecs.input.touchpad.surface" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trở về trang chủ
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">So sánh laptop</h1>

        {/* Overview Section */}
        <ComparisonOverview laptops={laptops} />

        {/* Key Differences */}
        <KeyDifferences laptops={laptops} keyDifferences={keyDifferences} />

        {/* Battery Comparison Chart */}
        <div className="mb-8">
          <BatteryComparisonChart 
            items={laptops.map(laptop => ({
              id: laptop.id,
              name: laptop.name,
              subtitle: laptop.detailedSpecs?.cpu?.name || '',
              batteryCapacity: Number.parseInt(laptop.detailedSpecs?.battery?.capacity || '0'),
              batteryLife: {
                hours: Math.floor(laptop.benchmarks?.battery || 0),
                minutes: Math.round(((laptop.benchmarks?.battery || 0) % 1) * 60)
              }
            }))}
          />
        </div>

        {/* Performance Comparison Chart */}
        <div className="mb-8">
          <PerformanceComparisonChart 
            items={laptops.map(laptop => ({
              id: laptop.id,
              name: laptop.name,
              subtitle: laptop.detailedSpecs?.cpu?.name || '',
              cpuScore: laptop.detailedSpecs?.cpu?.benchmarks?.geekbench6Multi || 0,
              gpuScore: laptop.detailedSpecs?.gpu?.benchmarks?.wildlifeExtreme || 0
            }))}
          />
        </div>

        {/* Adjust Importance section */}
        <ImportanceAdjuster laptops={laptops} weights={weights} setWeights={setWeights} />

        {/* Value for Money */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Giá tiền</h2>

          <div className="grid grid-cols-2 gap-8">
            {laptops.map((laptop, index) => (
              <div key={laptop.id} className="text-center">
                <div className="text-2xl font-bold mb-2 dark:text-white">{laptop.price || 'Không có thông tin'}</div>
                <div className="text-lg mb-4 dark:text-gray-300">

                </div>
                <RatingBar score={laptop.benchmarks?.value || 0} label="Đánh giá" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">So sánh chi tiết</h2>

          <ComparisonTable laptops={laptops} title="Vỏ" specs={caseSpecs} />
          <ComparisonTable laptops={laptops} title="Màn hình" specs={displaySpecs} />
          <ComparisonTable laptops={laptops} title="Cấu hình" specs={performanceSpecs} />
          <ComparisonTable laptops={laptops} title="Pin" specs={batterySpecs} />
          <ComparisonTable laptops={laptops} title="Tùy chọn kết nối" specs={connectivitySpecs} />
          <ComparisonTable laptops={laptops} title="Input" specs={inputSpecs} />
        </div>

        {/* User Voting */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Bạn yêu thích laptop nào hơn?</h2>

          <div className="grid grid-cols-2 gap-8">
            {laptops.map((laptop) => (
              <div key={laptop.id} className="text-center">
                <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg w-full">
                  Bình chọn cho {laptop.name}
                </button>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium dark:text-gray-300">1,245</span> users voted for this laptop
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded"
          >
            Trở về trang chủ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}