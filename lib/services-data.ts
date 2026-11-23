import type { StaticImageData } from "next/image"
import type { FeaturedService } from "@/components/home/service-card"

import acImg from "@/assets/cat-ac.jpg"
import devicesImg from "@/assets/cat-devices.jpg"
import electricalImg from "@/assets/cat-electrical.jpg"
import fridgeImg from "@/assets/cat-fridge.jpg"
import plumbingImg from "@/assets/cat-plumbing.jpg"
import washerImg from "@/assets/cat-washer.jpg"

export const serviceCategories = [
  { slug: "all", label: "All services" },
  { slug: "ac", label: "AC Repair" },
  { slug: "fridge", label: "Refrigerator" },
  { slug: "washer", label: "Washing Machine" },
  { slug: "electrical", label: "Electrical" },
  { slug: "plumbing", label: "Plumbing" },
  { slug: "devices", label: "Device Repair" },
] as const

export const defaultAvailability = "Sat–Thu, 9:00 AM – 8:00 PM"

export const allServices: (Omit<FeaturedService, "image"> & {
  image: StaticImageData
})[] = [
  {
    id: "split-ac-deep-servicing",
    title: "Split AC Deep Servicing",
    description:
      "Complete indoor and outdoor unit cleaning, filter wash, coil jet-wash, drainage check and cooling test.",
    category: "AC Repair",
    image: acImg,
    rating: 4.9,
    reviews: 128,
    price: 45,
    technician: "Rafiqul Islam",
    href: "/services/split-ac-deep-servicing",
  },
  {
    id: "refrigerator-cooling-repair",
    title: "Refrigerator Cooling Repair",
    description:
      "Diagnosis and repair of cooling problems, thermostat replacement, defrost system fixes and more.",
    category: "Refrigerator",
    image: fridgeImg,
    rating: 4.8,
    reviews: 91,
    price: 55,
    technician: "Rafiqul Islam",
    href: "/services/refrigerator-cooling-repair",
  },
  {
    id: "home-electrical-wiring",
    title: "Home Electrical Wiring",
    description:
      "Safe installation and repair of outlets, switches, light fittings, breakers and full-room wiring checks.",
    category: "Electrical",
    image: electricalImg,
    rating: 4.8,
    reviews: 112,
    price: 35,
    technician: "Rafiqul Islam",
    href: "/services/home-electrical-wiring",
  },
  {
    id: "ac-gas-refill-leak-fix",
    title: "AC Gas Refill & Leak Fix",
    description:
      "Leak detection with pressure testing, brazing of leak points and precise refrigerant refill to manufacturer specs.",
    category: "AC Repair",
    image: acImg,
    rating: 4.7,
    reviews: 64,
    price: 70,
    technician: "Tanvir Ahmed",
    href: "/services/ac-gas-refill-leak-fix",
  },
  {
    id: "laptop-device-repair",
    title: "Laptop & Device Repair",
    description:
      "Screen, battery, keyboard and board-level repair for laptops, tablets and smartphones with genuine parts.",
    category: "Device Repair",
    image: devicesImg,
    rating: 4.7,
    reviews: 76,
    price: 50,
    technician: "Rafiqul Islam",
    href: "/services/laptop-device-repair",
  },
  {
    id: "washing-machine-repair",
    title: "Washing Machine Repair",
    description:
      "Front and top load machine repair: drum noise, drainage blockage, motor and control board issues.",
    category: "Washing Machine",
    image: washerImg,
    rating: 4.6,
    reviews: 57,
    price: 40,
    technician: "Tanvir Ahmed",
    href: "/services/washing-machine-repair",
  },
  {
    id: "pipe-leak-fixture-repair",
    title: "Pipe Leak & Fixture Repair",
    description:
      "Leaking pipes, taps, flush tanks and basin fixtures repaired or replaced, with a pressure check before we leave.",
    category: "Plumbing",
    image: plumbingImg,
    rating: 4.5,
    reviews: 42,
    price: 38,
    technician: "Tanvir Ahmed",
    href: "/services/pipe-leak-fixture-repair",
  },
]

export function serviceImageForCategory(category: string): StaticImageData {
  const value = category.toLowerCase()
  if (value.includes("ac") || value.includes("air")) return acImg
  if (value.includes("fridge") || value.includes("refrigerator"))
    return fridgeImg
  if (value.includes("wash")) return washerImg
  if (value.includes("electric")) return electricalImg
  if (value.includes("plumb") || value.includes("pipe")) return plumbingImg
  if (
    value.includes("device") ||
    value.includes("laptop") ||
    value.includes("phone")
  ) {
    return devicesImg
  }
  return acImg
}
