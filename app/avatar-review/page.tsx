"use client";
import dynamic from "next/dynamic";
const Review = dynamic(() => import("@/components/arena/AvatarReview"), {
  ssr: false,
});
export default function Page() {
  return <Review />;
}
