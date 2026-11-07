"use client";
import { ContainerScroll } from "@/components/organisms/container-scroll-animation";
import Landingpage from "@/components/organisms/Landingpage";

const DEFAULT_HERO_VIDEO =
  "https://cdn.prod.website-files.com/66b6d7fd4d3e9cef94717176%2F6741fee19917cc8400fe361d_HackerRank%20Community%20Video-transcode.mp4";
const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || DEFAULT_HERO_VIDEO;

export default function Scroll() {
  return (
    <div className="flex flex-col justify-between mt-8 pb-12">
      <ContainerScroll
        titleComponent={
          <>
            <Landingpage />
          </>
        }
      >
        <video
          src={HERO_VIDEO_SRC}
          loop
          autoPlay
          height={1000}
          width={1200}
          muted
          playsInline
        />
      </ContainerScroll>
    </div>
  );
}