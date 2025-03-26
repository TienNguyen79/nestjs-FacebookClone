// gen ra ngẫu nhiên 6 số
export function generateRandomNumbers(length: number = 6): string {
  let otp: string = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Sinh số từ 0-9
  }
  return otp;
}
