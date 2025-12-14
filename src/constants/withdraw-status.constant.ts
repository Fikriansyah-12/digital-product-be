export const withdrawStatusConstant = {
    PENDING: 100,
    APPROVE:200 ,
    REJECTED: 300,
}

export const withdrawStatusStringConstant = {
    PENDING: 'sedang diproses',
    APPROVE: 'Sudah ditransfer',
    REJECTED: 'Gagal transfer',
}

export function getWithdrawStatus(status: string): number {
    switch (status.toLocaleLowerCase()) {
        case 'pending':
            return withdrawStatusConstant.PENDING;
        case 'approve':
            return withdrawStatusConstant.APPROVE;
        case 'rejected':
            return withdrawStatusConstant.REJECTED;    
        default:
            throw new Error('Invalid withdraw status');
    }
}