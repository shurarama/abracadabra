import _ from "lodash";
import * as solver from "javascript-lp-solver"

export type StockSize1D = { size: number; cost: number }
export type RequiredCuts1D = Array<{ size: number; count: number }>

export type ResultCuts1D = Array<{
    stock: StockSize1D
    count: number
    decimal: number
    cuts: Array<number>
}>

function isSubset(a: Array<number>, b: Array<number>) {
    const a2 = [...a]
    for (const n of b) {
        const i = a2.indexOf(n)
        if (i !== -1) {
            a2.splice(i, 1)
            if (a2.length === 0) {
                return true
            }
        }
    }
    return a2.length === 0
}

/**
 * Given a board of `size` and a list of `cuts` you
 * can make out of the board, how many unique ways of cutting the board
 * are there?
 */
export function howManyWays1D(
    args: {
        size: number
        bladeSize: number
        cuts: Array<number>
    },
    state: Array<number> = []
): Array<Array<number>> {
    const { size, bladeSize, cuts } = args
    const waysToCut = _.flatten(
        cuts.map(cut => {
            const remainder = size - cut
            if (remainder >= 0) {
                return howManyWays1D(
                    {
                        // Subtract bladeSize after because we might have a
                        // perfect fit with the remainder.
                        size: remainder - bladeSize,
                        bladeSize: bladeSize,
                        cuts: cuts,
                    },
                    [...state, cut]
                )
            } else {
                return [state]
            }
        })
    )

    let results: Array<Array<number>> = []
    for (const wayToCut of waysToCut) {
        // If existing cuts that are a subset of the new way to cut.
        results = results.filter(
            existingWayToCut => !isSubset(existingWayToCut, wayToCut)
        )
        // Add new way to cut if it is not a subset of an existing cut.
        const isSubsetOfExistingCut = results.some(existingWayToCut =>
            isSubset(wayToCut, existingWayToCut)
        )
        if (!isSubsetOfExistingCut) {
            results.push(wayToCut)
        }
    }
    return results
}

export function howManyWays(
    curSize: number,
    cutSizes: Array<number>,
    curCut: Array<number> = []
): Array<Array<number>>
{
    const localSizes = [...cutSizes];
    let results: Array<Array<number>> = [];

    while (localSizes.length !== 0) {
        let cutSize = localSizes[0];
        if (curSize >= cutSize) {
            let newCut = [...curCut, cutSize];
            let newSize = curSize - cutSize;
            if (cutSize < 600 / 3 && newSize >= cutSize) {
                results.push(...howManyWays(newSize, localSizes, newCut));
            } else {
                results.push(newCut, ...howManyWays(newSize, localSizes, newCut));
            }
        }
        localSizes.shift();
    }
    return results
}

/**
 * Given a stock side of wood you and buy, how many do I need and how do I cut it
 * in order to make enough pieces of with at the given sizes.
 */
export function howToCutBoards1D(args: {
    stockSizes: Array<StockSize1D>
    bladeSize: number // AKA Kerf.
    requiredCuts: RequiredCuts1D
}): ResultCuts1D {
    const { stockSizes, bladeSize, requiredCuts } = args
    const cutSizes = requiredCuts.map(({ size }) => size)

    cutSizes.sort((a, b) => { return b - a; });
    const waysOfCuttingStocks = stockSizes.map(({ size, cost }) => {

        // const newWays = howManyWays(size, cutSizes);

        const waysOfCutting = howManyWays1D({
            size: size,
            cuts: cutSizes,
            bladeSize: bladeSize,
        })

        // Transform [1,1,2,3] into {cut1: 2, cut2: 1, cut3: 3}.
        // Each will be the different versions of cutting the stock board.
        const versions = waysOfCutting.map(way => {
            const stockCut = {}
            for (const cut of cutSizes) {
                stockCut["cut" + cut] = 0
            }
            for (const cut of way) {
                stockCut["cut" + cut] = stockCut["cut" + cut] + 1
            }
            // stockCut["remainder"] = stockSize - _.sum(way)
            return stockCut
        })

        // const newVersions = newWays.map(way => {
        //     const stockCut = {}
        //     for (const cut of cutSizes) {
        //         stockCut["cut" + cut] = 0
        //     }
        //     let waySize = 0;
        //     for (const cut of way) {
        //         waySize += cut;
        //         stockCut["cut" + cut] = stockCut["cut" + cut] + 1
        //     }
        //     // stockCut["remainder"] = stockSize - _.sum(way)
        //     let wayCost = Math.ceil(Math.pow((waySize / size), 0.9) * 1000);
        //     return {stockCut: stockCut, wayCost: wayCost};
        // })

        return { size, cost, versions, waysOfCutting }
    })

    // console.log(util.inspect(waysOfCuttingStocks, false, null))

    // Create a variable for each version with a count: 1 which we will minimize.
    const variables = _.flatten(
        waysOfCuttingStocks.map(({ size, cost, versions }) =>
            versions.map((cut, index) => ({
                [size + "version" + index]: { ...cut, cost: cost },
                // [size + "version" + index]: { ...cut.stockCut, "cost": cut.wayCost },
            }))
        )
    ).reduce((acc, next) => ({ ...acc, ...next }))

    // We can't puchase part of a board, so the result but me an int, not a float.
    const ints = _.flatten(
        waysOfCuttingStocks.map(({ size, versions }) =>
            versions.map((cut, index) => ({
                [size + "version" + index]: 1,
            }))
        )
    ).reduce((acc, next) => ({ ...acc, ...next }))

    // Create constraints from the required cuts with a min on the count required.
    const constraints = requiredCuts
        .map(({ size, count }) => ({ ["cut" + size]: { min: count } }))
        .reduce((acc, next) => ({ ...acc, ...next }))

    // Create out model for the simplex linear programming solver.
    // https://github.com/JWally/jsLPSolver
    const model = {
        optimize: "cost",
        opType: "min",
        variables: variables,
        int: ints,
        constraints: constraints,
    }

    // Run the program
    const results = solver.Solve(model)

    // console.log(model)
    // console.log(results)

    if (!results.feasible) {
        throw new Error("Didn't work")
    }

    let resultCuts: ResultCuts1D = []

    // for (const { size, cost, newWays } of waysOfCuttingStocks) {
    for (const { size, cost, waysOfCutting } of waysOfCuttingStocks) {
        // for (let i = 0; i < newWays.length; i++) {
        for (let i = 0; i < waysOfCutting.length; i++) {
            const number = results[size + "version" + i]
            if (number !== undefined && number > 0) {
                // Need to take the ceiling because even though we're using integer mode,
                // the final cuts will still have a remainder balance which computes to
                // the remainder decimal. We'll store the raw decimal in there in case you
                // want to use it somewhere else.
                // https://github.com/JWally/jsLPSolver/issues/84
                resultCuts.push({
                    stock: { size, cost },
                    count: Math.ceil(number),
                    decimal: number,
                    cuts: waysOfCutting[i],
                    // cuts: newWays[i],
                })
            }
        }
    }

    resultCuts.sort((a, b) => a.count - b.count);
    for (const needCut of requiredCuts) {
        let resultCountOfCut = 0;
        for (const resultCut of resultCuts) {
            for (const sizeOfCut of resultCut.cuts) {
                if (needCut.size == sizeOfCut) resultCountOfCut += resultCut.count;
            }
        }
        console.log(resultCountOfCut);
        let needErase = resultCountOfCut - needCut.count;
        if (needErase > 0) {
            for (const resultCut of resultCuts) {
                let countOfCutInCurWay = 0;
                for (const sizeOfCut of resultCut.cuts) {
                    if (needCut.size == sizeOfCut) countOfCutInCurWay ++;
                }
                if (countOfCutInCurWay > 0) {
                    let countOfCutInCurRes = countOfCutInCurWay * resultCut.count;
                    let needEraseFromThisRes = countOfCutInCurRes > needErase ? needErase : countOfCutInCurRes;
                    needErase -= needEraseFromThisRes;
                    while (needEraseFromThisRes > 0) {
                        let CountOfModifiedCutsOfWay = needEraseFromThisRes > countOfCutInCurWay ? Math.floor(needEraseFromThisRes / countOfCutInCurWay) : 1;
                        const curEraseCountPerWay = needEraseFromThisRes > countOfCutInCurWay ? countOfCutInCurWay : needEraseFromThisRes;
                        resultCut.count -= CountOfModifiedCutsOfWay;
                        let erasedCount = 0;
                        let newCuts = resultCut.cuts.filter((size) => {
                            if (size == needCut.size && erasedCount < curEraseCountPerWay) {
                                erasedCount++;
                                return false;
                            }
                            return true;
                        });
                        const found = resultCuts.findIndex((resCut) => {
                            return resCut.cuts.sort().toString() === newCuts.sort().toString();
                        })
                        if (found !== -1) {
                            resultCuts[found].count += CountOfModifiedCutsOfWay;
                        } else {
                            resultCuts.push({...resultCut, count: CountOfModifiedCutsOfWay, cuts: newCuts })
                        }
                        needEraseFromThisRes -= CountOfModifiedCutsOfWay * curEraseCountPerWay;
                    }
                    console.log(countOfCutInCurWay);
                }
                if (needErase == 0) break;
            }
        }
    }
    resultCuts = resultCuts.filter( (resultCut) => {
        return resultCut.count > 0
    });
    let resWasModified = true;

    while (resWasModified)
    {
        resWasModified = false;

        resultCuts.sort((a, b) => a.cuts.reduce((ps, s) => ps + s) - b.cuts.reduce((ps, s) => ps + s));
        for (var i = 0; i < resultCuts.length; i++ ) {
            const sizeOfReplacedSet = resultCuts[i].cuts.reduce((ps, s) => ps + s);
            const countOfReplacedSet = resultCuts[i].count;
            for (var j = resultCuts.length - 1; j >= 0 && j > i && resultCuts[i].count > 0; j--) {
                const freeSpaceInSet = resultCuts[j].stock.size - resultCuts[j].cuts.reduce((ps, s) => ps + s);
                if (freeSpaceInSet >= sizeOfReplacedSet) {
                    const countOfSetWithFreeSpace = resultCuts[j].count;
                    const canPlaceInOneStock = Math.floor(freeSpaceInSet / sizeOfReplacedSet);
                    const placeInOneStock = canPlaceInOneStock > countOfReplacedSet
                        ? countOfReplacedSet
                        : canPlaceInOneStock;
                    const countForModify = placeInOneStock * countOfSetWithFreeSpace > countOfReplacedSet
                        ? Math.floor(countOfReplacedSet / placeInOneStock)
                        : countOfSetWithFreeSpace;
                    let newCuts = resultCuts[j].cuts;
                    for (let z = 0; z < placeInOneStock; z++)
                        newCuts = [...newCuts, ...resultCuts[i].cuts];
                    if (countForModify == countOfSetWithFreeSpace) {
                        resultCuts[j].cuts = newCuts;
                    } else { // countForModify < countOfSetWithFreeSpace
                        resultCuts[j].count -= countForModify;
                        resultCuts.push({...resultCuts[j], count: countForModify, cuts: newCuts });
                        resWasModified = true;
                    }
                    resultCuts[i].count -= countForModify * placeInOneStock;
                }
            }
        }
        resultCuts = resultCuts.filter( (resultCut) => {
            if (resultCut.count == 0) {
                resWasModified = true;
                return false;
            }
            return true;
        });

    }

    return resultCuts;

}
