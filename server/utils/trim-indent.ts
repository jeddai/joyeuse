export const trimIndent = (content: string): string => {
    return content.split('\n').map(line => line.trim()).join('\n');
}