export function currentDate()
{
    return new Date().toISOString().split("T")[0];
}
