CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"sender" text NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crop_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"crop_name" text NOT NULL,
	"crop_variety" text NOT NULL,
	"suitability_score" integer NOT NULL,
	"description" text NOT NULL,
	"days_to_maturity" integer NOT NULL,
	"e_nam_price" integer NOT NULL,
	"price_trend" real NOT NULL,
	"market_demand" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"location" text NOT NULL,
	"phone_number" text NOT NULL,
	"preferred_language" text DEFAULT 'english',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "farmers_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"farmer_id" integer NOT NULL,
	"name" text NOT NULL,
	"size" real NOT NULL,
	"soil_type" text NOT NULL,
	"location" text NOT NULL,
	"current_crop" text,
	"crop_variety" text,
	"planting_date" timestamp,
	"current_growth_stage" text,
	"growth_percentage" integer,
	"health_status" text,
	"irrigation_status" text,
	"last_irrigation_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "financial_assistance" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"interest_rate" real,
	"eligibility_details" text NOT NULL,
	"processing_time" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"commodity" text NOT NULL,
	"grade" text NOT NULL,
	"market" text NOT NULL,
	"state" text NOT NULL,
	"current_price" integer NOT NULL,
	"msp" integer NOT NULL,
	"price_change" real NOT NULL,
	"demand" text NOT NULL,
	"demand_percentage" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "weather_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"date" timestamp NOT NULL,
	"temperature" real NOT NULL,
	"condition" text NOT NULL,
	"humidity" integer NOT NULL,
	"wind_speed" real NOT NULL,
	"rain_chance" integer NOT NULL,
	"advisories" json
);
