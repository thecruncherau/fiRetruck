
// TODO: embed more substitutions, like !0 for TRUE
const substitutions = [
    {
        find: "1",
        replace: "((!0) + (!!0))"
    },
    {
        find: "2",
        replace: "((!0) + (!0))"
    },

]

const allowedCharacters = `\\!^()"[],`.split("")



// 6 -> [2, 1]
// 27 -> [4, 3, 1, 0] -> [[2], [1, 0], 1, 0]]
// 108 -> [6, 5, 3, 2] -> [[2, 1], [2, 0], [1, 0], 2]
// 1000 -> [9, 8, 7, 6, 5, 3] -> [[3, 0], [3], [2, 1, 0], [2, 1], [2, 0], [1, 0]] -> [[[1, 0], 0], [[1, 0]], [2, 1, 0], [2, 1], [2, 0], [1, 0]]

// recursively represents positive whole numbers as powers of 2
const representNumber = function (numberAsArray) {

    for (let i = 0; i < numberAsArray.length; ++i) {
        if (Array.isArray(numberAsArray[i])) {
            numberAsArray[i] = representNumber(numberAsArray[i])
        }

        if (numberAsArray[i] <= 2) continue

        let str = numberAsArray[i].toString(2).split("")
        numberAsArray[i] = str.map((x, index) => {
            if (x === "0") return -1
            return str.length - index - 1
        }).filter(x => x !== -1)

        if (numberAsArray[i].flat(Infinity).some(x => x > 2)) {
            numberAsArray[i] = representNumber(numberAsArray[i])
        }
    }

    return numberAsArray;
}

// interprets result from `representNumber` into string
const interpretIndexArrayToExpression = function (indexArray) {
    let result = "";

    for (let i = 0; i < indexArray[0].length; ++i) {
        if (Array.isArray(indexArray[0][i])) {
            result += result === "" ? "2 ^ (" : " + 2 ^ ("
            result += interpretIndexArrayToExpression([indexArray[0][i]])
            result += ")"
        } else {
            result += result === "" ? `2 ^ ${indexArray[0][i]}` : ` + 2 ^ ${indexArray[0][i]}`
        }
    }

    return result;

}

const charToUnicodeHex = function (input) {
    return input.charCodeAt(0).toString(16)
}

const convertNumber = function (number) {

    let expression = Number(number) <= 2 ? String(number) : interpretIndexArrayToExpression(representNumber([number]))
    let result = "";

    for (let i = 0; i < expression.length; ++i) {
        result += ["1", "2"].includes(expression[i]) ? substitutions.find(y => y.find === expression[i]).replace : expression[i]
    }

    return result;
}

const convertCharacter = function (character) {
    let u = "substr(!0, (!0) + (!0) + (!0) + (!!0), (!0) + (!0) + (!0) + (!!0))"
    let unicodeHex = charToUnicodeHex(character)

    if (!isNaN(Number(unicodeHex))) {
        return `parse(0, (!0) + (!!0), paste0("\\"", "\\\\", ${u}, ${convertNumber(Number(charToUnicodeHex(character)))}, "\\""))[[(!0) + (!!0)]]`
    }

    let unicodeHexArray = unicodeHex.split("")
    let curNumber = ""
    let result = ""

    for (let i = 0; i < unicodeHexArray.length; ++i) {
        if (isNaN(unicodeHexArray[i])) {
            result = `${result}${result === "" ? "" : ", "}${convertCharacter(unicodeHexArray[i])}`
            continue;
        }

        curNumber += unicodeHexArray[i]

        if (isNaN(unicodeHexArray[i + 1]) || i + 1 === unicodeHexArray.length) {
            result = `${result}${result === "" ? "" : ", "}${convertNumber(Number(curNumber))}`
            curNumber = "";
        }

    }

    // pad with function
    result = `paste0(${result})`

    return `parse(0, (!0) + (!!0), paste0("\\"", "\\\\", ${u}, ${result}, "\\""))[[(!0) + (!!0)]]`

}

// the main function
const convert = function (string) {
    let lines = string.split("\n")
    return lines.map(line => {
        let textBetweenSpaces = line.split(" ")
        return `paste0(${textBetweenSpaces.map(smallString => {
            let characters = smallString.split("")
            let result = "";
            let curNumber = "";


            for (let i = 0; i < characters.length; ++i) {
                if (allowedCharacters.includes(characters[i])) {
                    result = `${result}${result === "" ? "" : ", "}"${characters[i]}"`
                    continue;
                }

                if (isNaN(characters[i])) {
                    result = `${result}${result === "" ? "" : ", "}${convertCharacter(characters[i])}`
                    continue;
                }

                curNumber += characters[i]

                if (isNaN(characters[i + 1]) || i + 1 === characters.length) {
                    result = `${result}${result === "" ? "" : ", "}${convertNumber(Number(curNumber))}`
                    curNumber = "";
                }

            }

            return `paste0(${result})`
        }).join(`, ${convertCharacter(" ")},`)})`
    }).join("\n")
}

const copyToClipboard = function (text) {
    navigator.clipboard.writeText(text)
}
