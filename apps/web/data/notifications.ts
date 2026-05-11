export interface Notification {
  id: string;
  message: string;
  active: boolean;
  createdAt: string;
}

export const notifications: Notification[] = [
  {
    id: "1",
    message: "🔥 50% OFF – Today only!",
    active: true,
    createdAt: "2026-05-07",
  },
  {
    id: "2",
    message: "🎉 New Summer Collection is Live",
    active: true,
    createdAt: "2026-05-06",
  },
];



// export interface Notification {
//   id: string;
//   message: string;
//   active: boolean;
// }

// export const notifications: Notification[] = [
//   {
//     id: "1",
//     message: "🔥 50% OFF – Today only!",
//     active: true,
//   },
// ];