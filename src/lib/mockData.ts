export type Client = {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    currentWeight: number;
    targetWeight: number;
    ticketsRemaining: number;
    lastVisit: string;
    notes: string;
    image?: string;
};

export const MOCK_CLIENTS: Client[] = [
    {
        id: '1',
        name: '田中 優子',
        age: 32,
        gender: 'female',
        currentWeight: 58.5,
        targetWeight: 52.0,
        ticketsRemaining: 3,
        lastVisit: '2023-10-25',
        notes: '膝に違和感あり。スクワット軽めに。',
    },
    {
        id: '2',
        name: '佐藤 健太',
        age: 28,
        gender: 'male',
        currentWeight: 75.0,
        targetWeight: 68.0,
        ticketsRemaining: 0,
        lastVisit: '2023-10-28',
        notes: '増量期終了。これから絞りたい。',
    },
    {
        id: '3',
        name: '鈴木 愛',
        age: 45,
        gender: 'female',
        currentWeight: 62.0,
        targetWeight: 55.0,
        ticketsRemaining: 12,
        lastVisit: '2023-11-01',
        notes: '週2回のペースを維持できていて順調。',
    },
    {
        id: '4',
        name: '高橋 誠',
        age: 50,
        gender: 'male',
        currentWeight: 82.0,
        targetWeight: 72.0,
        ticketsRemaining: 1,
        lastVisit: '2023-10-20',
        notes: '仕事が忙しく来れていない。連絡必要。',
    },
];

export const TODAY_APPOINTMENTS = [
    {
        id: 'apt1',
        clientId: '1',
        time: '10:00',
        status: 'scheduled', // scheduled, completed, cancelled
    },
    {
        id: 'apt2',
        clientId: '2',
        time: '13:00',
        status: 'scheduled',
    },
    {
        id: 'apt3',
        clientId: '3',
        time: '18:30',
        status: 'scheduled',
    },
];
