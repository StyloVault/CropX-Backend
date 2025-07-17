export const amountToKobo = (amount: number) =>{
    return amount * 100;
}

export const isPositiveInteger = (value)=> {
    const parsedValue = parseInt(value);
    return Number.isInteger(parsedValue) && parsedValue > 0;
}
  
export const isValidAmount = (amount) => {
    // Regular expression pattern to match amount with maximum 2 decimal places
    const pattern = /^\d+(\.\d{1,2})?$/;
    return pattern.test(amount);
  }