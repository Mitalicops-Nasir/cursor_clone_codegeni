//BASE PADDING FO RROOT LEVEL ITEM (AFTER PROJECT HEADER)
export const BASE_PADDING = 12

//ADDITIONAL PADDING PER NESTING LEVEL
export const LEVEL_PADDING = 12

export const getItemPadding = (level: number, isFile: boolean) => {
    const fileOfSet = isFile ? 16 : 0;
    return BASE_PADDING + level * LEVEL_PADDING + fileOfSet
}

