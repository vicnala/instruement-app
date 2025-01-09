
export function getLuthierPermissions(minter: any) {
    let isLuthier = false;
    let isVerified = false;
    let isMinter = false;

    if (minter.is_luthier) isLuthier = true;
    if (minter.is_verified) isVerified = true;
    if (minter.skills) {
        if (Array.isArray(minter.skills)) {
            const constructor = minter.skills.find((s: any) => s.slug.includes('construction'));
            if (constructor) isMinter = true;
        }
    }

    return { isLuthier, isVerified, isMinter };
}
