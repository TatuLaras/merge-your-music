export function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// Capitalize first letter of a string
export function capitalize(str: string):string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Wraps an image source url into a react style propery
export function asCssUrl(url: string) {
    return {'--img-src': `url(${url})`} as React.CSSProperties;
}

export function shuffle(arr: any[]): any[] {
    let currentIndex = arr.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
  
    return arr;
  }