
type FormatType = {
    param: string;
    setError: (value: React.SetStateAction<string | undefined>) => void;
}

export function onlyNumbers({param, setError}: FormatType): boolean {
    const onlyNumbers = /^\d+$/.test(param);
    if(!onlyNumbers) {
        console.warn("Use only numbers in the input for this parameter, please");
        setError("Only numbers");
        return false;
    }
    return true; 
}

export function onlyNumbersComma({param, setError}: FormatType): boolean {
    const onlyNumbersCommaSpace = /^[\d\s,]+$/.test(param);
    if(!onlyNumbersCommaSpace) {
        console.warn("Use only numbers, comma and space in the input for this parameter, please");
        setError("Only numbers, comma, space");
        return false;
    }
    return true; 
}

