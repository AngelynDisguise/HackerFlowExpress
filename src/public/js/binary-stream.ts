function generateRandomBinary(): number {
    return Math.random() < 0.5 ? 0 : 1
}

function updateBinaryColumn(binaryElements: NodeListOf<HTMLElement>) {
    const columnLength = 100  // can change
    binaryElements.forEach((binaryElement) => {
        let newColumn = '';
        for (let i = 0; i < columnLength; i++) {
            newColumn += generateRandomBinary().toString() + '<br>';
        }
        binaryElement.innerHTML = newColumn;
    });
}

const binaryStream1Elements: NodeListOf<HTMLElement> = document.querySelectorAll('.binary-stream1')
const binaryStream2Elements: NodeListOf<HTMLElement> = document.querySelectorAll('.binary-stream2')

// Update binary stream every 0.5 seconds
setInterval(() => updateBinaryColumn(binaryStream1Elements), 500)
setInterval(() => updateBinaryColumn(binaryStream2Elements), 500)
