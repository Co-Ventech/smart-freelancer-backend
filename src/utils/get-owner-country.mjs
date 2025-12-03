import { countries } from "countries-ts"

export const getOwnerCountry = (project, usersMap = {}) => {
    const ownerId = project.owner_id ?? project.owner?.id ?? project.user_id ?? null;
    let owner = undefined;

    if (ownerId != null) {
        // usersMap keys might be numbers or strings; try both
        owner = usersMap[ownerId] || usersMap[String(ownerId)] || usersMap[Number(ownerId)];
    }
    owner = owner || project.owner || project.user || project.users?.[Object.keys(project.users || {})[0]];

    const country =
        owner?.location?.country?.name ||
        owner?.profile?.location?.country?.name ||
        project.location?.country?.name ||
        '';

    return country;
};


const normalize = (s) => (s || '').toString().trim().toLowerCase();

export const isExcludedCountry = (countryName, userExcludedCountries) => {
    if (!countryName) return false;
    const n = normalize(countryName);
    return userExcludedCountries?.some((c) => n?.toLowerCase().includes(c?.toLowerCase()) || c?.toLowerCase().includes(n?.toLowerCase()));
};

export const getAllowedCountries = (excludedCountries) => {
    const excludedAlpha2 = countries
        .filter(country => !excludedCountries?.includes(country.label))
    return excludedAlpha2?.map(c => c.code?.toLocaleLowerCase());
}
