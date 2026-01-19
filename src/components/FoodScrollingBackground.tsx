"use client";

import { useMemo } from "react";
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
} from "@/components/kibo-ui/marquee";

const foodImages = [
  { src: "https://www.svgrepo.com/show/475216/pizza.svg", alt: "Pizza" },
  { src: "https://www.svgrepo.com/show/475220/pretzel.svg", alt: "Pretzel" },
  { src: "https://www.svgrepo.com/show/475195/hamburger.svg", alt: "Burger" },
  { src: "https://www.svgrepo.com/show/475192/cupcake.svg", alt: "Cupcake" },
  { src: "https://www.svgrepo.com/show/475187/cookies.svg", alt: "Cookies" },
  { src: "https://www.svgrepo.com/show/475209/pancake.svg", alt: "Pancake" },
  { src: "https://www.svgrepo.com/show/475224/steak.svg", alt: "Steak" },
  { src: "https://www.svgrepo.com/show/475228/taco.svg", alt: "Taco" },
  { src: "https://www.svgrepo.com/show/475231/thanksgiving.svg", alt: "Chicken" },
  { src: "https://www.svgrepo.com/show/475236/bacon.svg", alt: "Bacon" },
];

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Number of rows to display (adjust for more/less coverage)
const ROW_COUNT = 6;

const FoodScrollingBackground = () => {
  // Memoize shuffled arrays so they don't re-shuffle on every render
  const shuffledRows = useMemo(() => {
    return Array.from({ length: ROW_COUNT }, () => shuffleArray(foodImages));
  }, []);

  return (
    <div className="flex flex-col justify-evenly h-full w-full bg-background">
      {shuffledRows.map((foods, rowIndex) => (
        <Marquee key={rowIndex}>
          <MarqueeContent
            direction={rowIndex % 2 === 0 ? "left" : "right"}
            speed={20 + (rowIndex % 3) * 5} // Vary speeds slightly
          >
            {foods.map((food, index) => (
              <MarqueeItem
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24"
                key={index}
              >
                <img
                  alt={food.alt}
                  className="overflow-hidden rounded-full"
                  src={food.src}
                />
              </MarqueeItem>
            ))}
          </MarqueeContent>
        </Marquee>
      ))}
    </div>
  );
};

export default FoodScrollingBackground;
