// src/types/plants.ts

export interface Plant {
    $id: string;
    PlantName: string;
    Image: string | null;
    plant_catergory: string;
    Plant_family: string;
    isFavourite: boolean;
    timestamp: string;
}

export interface UserPlant {
    $id: string;
    plant_id: string;
    waterlevel: string;
    carelevel: string;
    plantedat: string;
    nutrients: string[];
    nutrientsid: string[];
    activeNutrients: string;
    userId: string;
    timestamp: string;
}

export interface Nutrient {
    $id: string;
    name: string;
    desc: string;
    ima: string | null;
    isPremium: boolean;
    timer: string;
    timestamp: string;
}

export interface ActiveNutrient {
    nutrientId: string;
    nutrientName: string;
    timer: number;
}

