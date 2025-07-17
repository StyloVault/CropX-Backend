export const randomNumberGenerator = (
  min = 0,
  max = 9,
  padding = '0',
  noOfChars = 6,
) => {
  let randomNumber: any = Math.floor(Math.random() * (max - min) + min);
  console.log(randomNumber);
  randomNumber = '' + randomNumber;

  return randomNumber.padStart(noOfChars, padding);
};
