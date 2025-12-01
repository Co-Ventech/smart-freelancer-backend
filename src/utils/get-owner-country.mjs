import { countries } from "countries-ts";

const EXCLUDED_COUNTRIES = [
    'pakistan',
    'india',
    'bangladesh',
    'indonesia',
    'algeria',
    'egypt',
    'nepal',
    'israel'
];

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

export const isExcludedCountry = (countryName) => {
    if (!countryName) return false;
    const n = normalize(countryName);
    return EXCLUDED_COUNTRIES.some((c) => n.includes(c) || c.includes(n));
};

export const getAllowedCountries = (excludedCountries) => {
    const excludedAlpha2 = countries
        .filter(country => !excludedCountries?.includes(country.label))
    return excludedAlpha2?.map(c => c.code?.toLocaleLowerCase());
}
