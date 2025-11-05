import {
  type User,
  type InsertUser,
  type Farm,
  type InsertFarm,
  type Animal,
  type InsertAnimal,
  type TreatmentRecord,
  type InsertTreatmentRecord,
  type FarmReport,
  type InsertFarmReport,
} from "../schema";
import { createClient } from "@supabase/supabase-js";
import { type IStorage } from "./index";

// Create server-side Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert({
        username: insertUser.username,
        password: insertUser.password,
        email: insertUser.email,
        full_name: insertUser.fullName,
        role: insertUser.role,
        farm_id: insertUser.farmId ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      username: data.username,
      password: data.password,
      fullName: data.full_name,
      role: data.role,
      email: data.email,
      farmId: data.farm_id,
    } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("username");

    if (error) throw new Error(error.message);
    
    return (data || []).map(user => ({
      id: user.id,
      username: user.username,
      password: user.password,
      fullName: user.full_name,
      role: user.role,
      email: user.email,
      farmId: user.farm_id,
      createdAt: user.created_at ? new Date(user.created_at) : new Date(),
      updatedAt: user.updated_at ? new Date(user.updated_at) : new Date(),
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", userId);

    if (error) throw new Error(error.message);
  }

  // Farm methods
  async getAllFarms(): Promise<Farm[]> {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("name");

    if (error) throw new Error(error.message);
    
    return (data || []).map(farm => ({
      id: farm.id,
      name: farm.name,
      location: farm.location,
      ownerName: farm.owner_name,
      registrationNumber: farm.registration_number,
      contactEmail: farm.contact_email,
      contactPhone: farm.contact_phone,
      totalAnimals: farm.total_animals,
    }));
  }

  async getFarmById(id: string): Promise<Farm | undefined> {
    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    
    return {
      id: data.id,
      name: data.name,
      location: data.location,
      ownerName: data.owner_name,
      registrationNumber: data.registration_number,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      totalAnimals: data.total_animals,
    };
  }

  async createFarm(insertFarm: InsertFarm): Promise<Farm> {
    const { data, error } = await supabase
      .from("farms")
      .insert({
        name: insertFarm.name,
        location: insertFarm.location,
        owner_name: insertFarm.ownerName,
        registration_number: insertFarm.registrationNumber,
        contact_email: insertFarm.contactEmail,
        contact_phone: insertFarm.contactPhone,
        total_animals: 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      name: data.name,
      location: data.location,
      ownerName: data.owner_name,
      registrationNumber: data.registration_number,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      totalAnimals: data.total_animals,
    };
  }

  async updateFarmAnimalCount(farmId: string, count: number): Promise<void> {
    const { error } = await supabase
      .from("farms")
      .update({ total_animals: count })
      .eq("id", farmId);

    if (error) throw new Error(error.message);
  }

  // Animal methods
  async getAllAnimals(): Promise<Animal[]> {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .order("name");

    if (error) throw new Error(error.message);
    
    return (data || []).map(animal => ({
      id: animal.id,
      farmId: animal.farm_id,
      tagNumber: animal.tag_number,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      dateOfBirth: animal.date_of_birth,
      weight: animal.weight,
      status: animal.status,
    }));
  }

  async getAnimalById(id: string): Promise<Animal | undefined> {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    
    return {
      id: data.id,
      farmId: data.farm_id,
      tagNumber: data.tag_number,
      name: data.name,
      species: data.species,
      breed: data.breed,
      dateOfBirth: data.date_of_birth,
      weight: data.weight,
      status: data.status,
    };
  }

  async getAnimalsByFarmId(farmId: string): Promise<Animal[]> {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .eq("farm_id", farmId)
      .order("name");

    if (error) throw new Error(error.message);
    
    return (data || []).map(animal => ({
      id: animal.id,
      farmId: animal.farm_id,
      tagNumber: animal.tag_number,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      dateOfBirth: animal.date_of_birth,
      weight: animal.weight,
      status: animal.status,
    }));
  }

  async createAnimal(insertAnimal: InsertAnimal): Promise<Animal> {
    const { data, error } = await supabase
      .from("animals")
      .insert({
        farm_id: insertAnimal.farmId,
        tag_number: insertAnimal.tagNumber,
        name: insertAnimal.name,
        species: insertAnimal.species,
        breed: insertAnimal.breed ?? null,
        date_of_birth: insertAnimal.dateOfBirth ?? null,
        weight: insertAnimal.weight ?? null,
        status: insertAnimal.status ?? "active",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update farm animal count
    const farmAnimals = await this.getAnimalsByFarmId(insertAnimal.farmId);
    await this.updateFarmAnimalCount(insertAnimal.farmId, farmAnimals.length);
    
    return {
      id: data.id,
      farmId: data.farm_id,
      tagNumber: data.tag_number,
      name: data.name,
      species: data.species,
      breed: data.breed,
      dateOfBirth: data.date_of_birth,
      weight: data.weight,
      status: data.status,
    };
  }

  // Treatment Record methods
  async getAllTreatmentRecords(): Promise<TreatmentRecord[]> {
    const { data, error } = await supabase
      .from("treatment_records")
      .select("*")
      .order("administered_date", { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(record => ({
      id: record.id,
      animalId: record.animal_id,
      farmId: record.farm_id,
      medicineName: record.medicine_name,
      antimicrobialType: record.antimicrobial_type,
      dosage: record.dosage,
      unit: record.unit,
      administeredBy: record.administered_by,
      administeredDate: record.administered_date,
      withdrawalPeriodDays: record.withdrawal_period_days,
      withdrawalEndDate: record.withdrawal_end_date,
      purposeOfTreatment: record.purpose_of_treatment,
      mrlLevel: record.mrl_level,
      complianceStatus: record.compliance_status,
      notes: record.notes,
      recordedBy: record.recorded_by,
    }));
  }

  async getTreatmentRecordById(id: string): Promise<TreatmentRecord | undefined> {
    const { data, error } = await supabase
      .from("treatment_records")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    
    return {
      id: data.id,
      animalId: data.animal_id,
      farmId: data.farm_id,
      medicineName: data.medicine_name,
      antimicrobialType: data.antimicrobial_type,
      dosage: data.dosage,
      unit: data.unit,
      administeredBy: data.administered_by,
      administeredDate: data.administered_date,
      withdrawalPeriodDays: data.withdrawal_period_days,
      withdrawalEndDate: data.withdrawal_end_date,
      purposeOfTreatment: data.purpose_of_treatment,
      mrlLevel: data.mrl_level,
      complianceStatus: data.compliance_status,
      notes: data.notes,
      recordedBy: data.recorded_by,
    };
  }

  async getTreatmentRecordsByFarmId(farmId: string): Promise<TreatmentRecord[]> {
    const { data, error } = await supabase
      .from("treatment_records")
      .select("*")
      .eq("farm_id", farmId)
      .order("administered_date", { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(record => ({
      id: record.id,
      animalId: record.animal_id,
      farmId: record.farm_id,
      medicineName: record.medicine_name,
      antimicrobialType: record.antimicrobial_type,
      dosage: record.dosage,
      unit: record.unit,
      administeredBy: record.administered_by,
      administeredDate: record.administered_date,
      withdrawalPeriodDays: record.withdrawal_period_days,
      withdrawalEndDate: record.withdrawal_end_date,
      purposeOfTreatment: record.purpose_of_treatment,
      mrlLevel: record.mrl_level,
      complianceStatus: record.compliance_status,
      notes: record.notes,
      recordedBy: record.recorded_by,
    }));
  }

  async getTreatmentRecordsByAnimalId(animalId: string): Promise<TreatmentRecord[]> {
    const { data, error } = await supabase
      .from("treatment_records")
      .select("*")
      .eq("animal_id", animalId)
      .order("administered_date", { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(record => ({
      id: record.id,
      animalId: record.animal_id,
      farmId: record.farm_id,
      medicineName: record.medicine_name,
      antimicrobialType: record.antimicrobial_type,
      dosage: record.dosage,
      unit: record.unit,
      administeredBy: record.administered_by,
      administeredDate: record.administered_date,
      withdrawalPeriodDays: record.withdrawal_period_days,
      withdrawalEndDate: record.withdrawal_end_date,
      purposeOfTreatment: record.purpose_of_treatment,
      mrlLevel: record.mrl_level,
      complianceStatus: record.compliance_status,
      notes: record.notes,
      recordedBy: record.recorded_by,
    }));
  }

  async createTreatmentRecord(insertRecord: InsertTreatmentRecord): Promise<TreatmentRecord> {
    // Determine compliance status based on MRL level
    let complianceStatus = insertRecord.complianceStatus || "pending";
    if (insertRecord.mrlLevel) {
      const mrlValue = parseFloat(insertRecord.mrlLevel.toString());
      if (mrlValue < 50) {
        complianceStatus = "compliant";
      } else if (mrlValue < 100) {
        complianceStatus = "warning";
      } else {
        complianceStatus = "violation";
      }
    }

    const { data, error } = await supabase
      .from("treatment_records")
      .insert({
        animal_id: insertRecord.animalId,
        farm_id: insertRecord.farmId,
        medicine_name: insertRecord.medicineName,
        antimicrobial_type: insertRecord.antimicrobialType,
        dosage: insertRecord.dosage,
        unit: insertRecord.unit,
        administered_by: insertRecord.administeredBy,
        administered_date: insertRecord.administeredDate,
        withdrawal_period_days: insertRecord.withdrawalPeriodDays,
        withdrawal_end_date: insertRecord.withdrawalEndDate,
        purpose_of_treatment: insertRecord.purposeOfTreatment,
        mrl_level: insertRecord.mrlLevel ?? null,
        compliance_status: complianceStatus,
        notes: insertRecord.notes ?? null,
        recorded_by: insertRecord.recordedBy,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      animalId: data.animal_id,
      farmId: data.farm_id,
      medicineName: data.medicine_name,
      antimicrobialType: data.antimicrobial_type,
      dosage: data.dosage,
      unit: data.unit,
      administeredBy: data.administered_by,
      administeredDate: data.administered_date,
      withdrawalPeriodDays: data.withdrawal_period_days,
      withdrawalEndDate: data.withdrawal_end_date,
      purposeOfTreatment: data.purpose_of_treatment,
      mrlLevel: data.mrl_level,
      complianceStatus: data.compliance_status,
      notes: data.notes,
      recordedBy: data.recorded_by,
    };
  }

  // Farm Report methods
  async getAllFarmReports(): Promise<FarmReport[]> {
    const { data, error } = await supabase
      .from("farm_reports")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(report => ({
      id: report.id,
      farmId: report.farm_id,
      fileName: report.file_name,
      fileType: report.file_type,
      fileSize: report.file_size,
      uploadedBy: report.uploaded_by,
      uploadedAt: report.uploaded_at,
      reportType: report.report_type,
      description: report.description,
    }));
  }

  async getFarmReportById(id: string): Promise<FarmReport | undefined> {
    const { data, error } = await supabase
      .from("farm_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return undefined;
    
    return {
      id: data.id,
      farmId: data.farm_id,
      fileName: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      uploadedBy: data.uploaded_by,
      uploadedAt: data.uploaded_at,
      reportType: data.report_type,
      description: data.description,
    };
  }

  async getFarmReportsByFarmId(farmId: string): Promise<FarmReport[]> {
    const { data, error } = await supabase
      .from("farm_reports")
      .select("*")
      .eq("farm_id", farmId)
      .order("uploaded_at", { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map(report => ({
      id: report.id,
      farmId: report.farm_id,
      fileName: report.file_name,
      fileType: report.file_type,
      fileSize: report.file_size,
      uploadedBy: report.uploaded_by,
      uploadedAt: report.uploaded_at,
      reportType: report.report_type,
      description: report.description,
    }));
  }

  async createFarmReport(insertReport: InsertFarmReport): Promise<FarmReport> {
    const { data, error } = await supabase
      .from("farm_reports")
      .insert({
        farm_id: insertReport.farmId,
        file_name: insertReport.fileName,
        file_type: insertReport.fileType,
        file_size: insertReport.fileSize,
        uploaded_by: insertReport.uploadedBy,
        uploaded_at: new Date().toISOString(),
        report_type: insertReport.reportType,
        description: insertReport.description ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    return {
      id: data.id,
      farmId: data.farm_id,
      fileName: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      uploadedBy: data.uploaded_by,
      uploadedAt: data.uploaded_at,
      reportType: data.report_type,
      description: data.description,
    };
  }
}
