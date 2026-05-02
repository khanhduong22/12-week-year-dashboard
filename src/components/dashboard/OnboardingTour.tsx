"use client";

import { useEffect, useState } from "react";
import { Joyride, EventData, STATUS, Step } from "react-joyride";

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Welcome to 12-Week Year Architect!",
      content: "Let's take a quick tour to see how you can crush your goals by executing daily tactics instead of making annual resolutions.",
      skipBeacon: true,
    },
    {
      target: "#tour-config",
      placement: "bottom",
      title: "Step 1: Configure Tactics",
      content: "Start here. Define your daily or weekly actionable habits (Tactics) that will lead to your 12-week goal. Assign them weights based on importance.",
      skipBeacon: true,
    },
    {
      target: "#tour-log",
      placement: "bottom",
      title: "Step 2: Log Daily",
      content: "At the end of every day, come here to check off what you accomplished. Honesty is crucial for accurate scorecards.",
      skipBeacon: true,
    },
    {
      target: "#tour-scorecard",
      placement: "right",
      title: "The Weekly Scorecard",
      content: "Your execution is scored here automatically. Keep it above 85% to ensure you're on track to hit your goals. If it drops, the system will warn you.",
      skipBeacon: true,
    },
    {
      target: "#tour-bsc",
      placement: "top",
      title: "The BSC Grid",
      content: "A visual heat map showing exactly which tactics you hit on which days. Green is good! Spot your weak areas easily.",
      skipBeacon: true,
    },
    {
      target: "#tour-about",
      placement: "bottom",
      title: "Need a Refresher?",
      content: "Click here anytime to re-read the 12-Week Year framework concepts. Now, let's start executing!",
      skipBeacon: true,
    }
  ];

  useEffect(() => {
    // Check if the user has already seen the tour
    const hasSeenTour = localStorage.getItem("hasSeen12WYTour");
    if (!hasSeenTour) {
      // Small delay to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Listen for custom event to manually trigger tour
    const handleTriggerTour = () => {
      setRun(true);
    };
    window.addEventListener("start-tour", handleTriggerTour);
    return () => window.removeEventListener("start-tour", handleTriggerTour);
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("hasSeen12WYTour", "true");
    }
  };

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        showProgress: true,
        buttons: ['back', 'primary', 'skip'],
        zIndex: 10000,
        primaryColor: "#ffffff",
        backgroundColor: "#18181b",
        textColor: "#f4f4f5",
        arrowColor: "#18181b",
      }}
      styles={{
        buttonPrimary: {
          backgroundColor: "#ffffff",
          color: "#000000",
          fontWeight: "bold",
          borderRadius: "9999px",
        },
        buttonBack: {
          color: "#a1a1aa",
        },
        buttonSkip: {
          color: "#71717a",
        },
        tooltipContainer: {
          textAlign: "left"
        }
      }}
    />
  );
}
