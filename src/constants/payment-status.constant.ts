export const paymentStatusConstant = {
    PENDING: 100,
    SETTELEMENT: 200,
    EXPIRE: 300,
}

export const paymentStatusLabel = {
    [paymentStatusConstant.PENDING]: 'Pending',
    [paymentStatusConstant.SETTELEMENT]:'Settlement',
    [paymentStatusConstant.EXPIRE]: 'Expire',
}

export function getPaymentStatus(status: string): number {
    switch (status.toLocaleLowerCase()) {
        case 'penting':
            return paymentStatusConstant.PENDING;
        case 'settlement':
            return paymentStatusConstant.SETTELEMENT;
        case 'expire':
            return paymentStatusConstant.EXPIRE;    
        default:
            throw new Error('Invalid payment status');
    }
}