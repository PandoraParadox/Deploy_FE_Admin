export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
        return 0
    }
    return amount.toLocaleString("vi-VN")
}