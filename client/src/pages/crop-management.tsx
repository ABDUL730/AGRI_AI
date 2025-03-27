import { useState } from "react";
import { Field } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { FieldList } from "@/components/crop-management/field-list";
import { AddFieldForm } from "@/components/crop-management/add-field-form";
import { FieldDetail } from "@/components/crop-management/field-detail";
import { CropRecommendationsTable } from "@/components/crop-management/crop-recommendations-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CropManagement() {
  const { t } = useLanguage();
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [isFieldDetailOpen, setIsFieldDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");

  const handleAddField = () => {
    setIsAddFieldOpen(true);
  };

  const handleCloseAddField = () => {
    setIsAddFieldOpen(false);
  };

  const handleViewField = (field: Field) => {
    setSelectedFieldId(field.id);
    setIsFieldDetailOpen(true);
  };

  const handleCloseFieldDetail = () => {
    setIsFieldDetailOpen(false);
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("Crop Management")}</h1>
        <p className="text-muted-foreground">{t("Manage your fields and crop information")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">{t("My Fields")}</TabsTrigger>
          <TabsTrigger value="recommendations">{t("Crop Recommendations")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fields" className="mt-6">
          <FieldList
            onAddField={handleAddField}
            onViewField={handleViewField}
          />
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <CropRecommendationsTable />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <AddFieldForm 
        isOpen={isAddFieldOpen} 
        onClose={handleCloseAddField} 
      />
      
      <FieldDetail 
        fieldId={selectedFieldId} 
        isOpen={isFieldDetailOpen} 
        onClose={handleCloseFieldDetail} 
      />
    </div>
  );
}