// README.md | [26]
import prismaInstance from "@/lib/connection.js";

class DashboardModel {
    getSellsByFilter = async (limit: number = 5) => {
        return await prismaInstance.sells.findMany({
            where: {
                sellStatus: "CANCELADO",
            },
            orderBy: {
                createdAt: "asc",
            },
            take: limit,
            include:{
                client: {
                    select: {name: true, dni: true,},
                },
                sellDetails: true,
            },
        });
    };
    getDashboardStats = async () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
        const sellsOfThisYear = await prismaInstance.sells.findMany({
            where: {
                sellStatus: 'CANCELADO',
                createdAt: {
                    gte: startOfYear,
                },
            },
            select: {
                total: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startWeek = new Date(now);
        const day = startWeek.getDay();
        const diff = startWeek.getDate() - day + (day === 0 ? -6 : 1);
        startWeek.setDate(diff);
        startWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalToday = 0;
        let totalWeek = 0;
        let totalMonth = 0;
        
        sellsOfThisYear.forEach(sale => {
            const saleDate = new Date(sale.createdAt);
            const saleTotal = Number(sale.total);

            if (saleDate >= startOfToday) totalToday += saleTotal;
            if (saleDate >= startWeek) totalWeek += saleTotal;
            if (saleDate >= startOfMonth) totalMonth += saleTotal;
        });
        const monthlyGraphData = Array.from({length: 12}, (_, i) => ({
            name: new Date(currentYear, i).toLocaleString('es-ES', {month: 'short'}),
            ganancias: 0,
        }));
        sellsOfThisYear.forEach(sale => {
            const monthIndex = new Date(sale.createdAt).getMonth();
            monthlyGraphData[monthIndex]!.ganancias += Number(sale.total);
        });

        return {
            cards: {
                today: totalToday,
                week: totalWeek,
                month: totalMonth,
                year: sellsOfThisYear.reduce((acc, si) => acc + Number(si.total), 0),
            },
            chart: monthlyGraphData,
        };
    };
}

export default new DashboardModel();