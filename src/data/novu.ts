import type { NovuOverview } from "@/types/novu";

export const novuOverview: NovuOverview = {
  profile: {
    id: "user-demo-diego",
    firstName: "Diego",
    fullName: "Diego López",
    email: "diego@correo.com",
  },
  personalGoal: {
    id: "goal-antigua",
    name: "Viaje a Antigua",
    savedAmount: 1250,
    targetAmount: 2000,
    weeklyContribution: 180,
    progress: 62,
    currency: "GTQ",
  },
  recentActivity: [
    {
      id: "weekly",
      name: "Aporte semanal",
      dateLabel: "Hoy",
      amountLabel: "+ Q 180",
      tone: "success",
    },
    {
      id: "challenge",
      name: "Reto de julio",
      dateLabel: "Ayer",
      amountLabel: "+ Q 75",
      tone: "success",
    },
    {
      id: "coffee",
      name: "Café con amigos",
      dateLabel: "12 ago",
      amountLabel: "− Q 45",
      tone: "muted",
    },
  ],
};
