export const reverseMergeSort = <A>(array : A[], tempArray : A[], left : number, right : number) : void => {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    reverseMergeSort(array, tempArray, left, mid);
    reverseMergeSort(array, tempArray, mid + 1, right);
    reverseMerge(array, tempArray, left, mid, right);
};

export const reverseMerge = <A>(array : A[], tempArray : A[], left : number, mid : number, right : number) : void => {
    let i = left, j = mid + 1, k = left;

    while (i <= mid && j <= right) {
        if ((array[i] as any).id > (array[j] as any).id) {
            tempArray[k++] = array[i++];
        } else {
            tempArray[k++] = array[j++];
        }
    }

    while (i <= mid) tempArray[k++] = array[i++];
    while (j <= right) tempArray[k++] = array[j++];

    for (i = left; i <= right; i++) array[i] = tempArray[i];
};

export const reverseInsertionSort = <A>(arr : A[], left : number, right : number) : void => {
    for (let i = left + 1; i <= right; i++) {
        const key = arr[i];
        let j = i - 1;

        while (j >= left && (arr[j] as any).id < (key as any).id) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
};

export const chunkMergeSort = <A>(array : A[], tempArray : A[], left : number, right : number) : void => {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    chunkMergeSort(array, tempArray, left, mid);
    chunkMergeSort(array, tempArray, mid + 1, right);
    chunkMerge(array, tempArray, left, mid, right);
};

export const chunkMerge = <A>(array : A[], tempArray : A[], left : number, mid : number, right : number) : void => {
    let i = left, j = mid + 1, k = left;

    while (i <= mid && j <= right) {
        if ((array[i] as any).chunkIndex >= (array[j] as any).chunkIndex) {
            tempArray[k++] = array[i++];
        } else {
            tempArray[k++] = array[j++];
        }
    }

    while (i <= mid) tempArray[k++] = array[i++];
    while (j <= right) tempArray[k++] = array[j++];

    for (i = left; i <= right; i++) array[i] = tempArray[i];
};

export const chunksInsertionSort = <A>(arr : A[], left : number, right : number) : void => {
    for (let i = left + 1; i <= right; i++) {
        const key = arr[i];
        let j = i - 1;

        while (j >= left && (arr[j] as any).chunkIndex < (key as any).chunkIndex) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
};