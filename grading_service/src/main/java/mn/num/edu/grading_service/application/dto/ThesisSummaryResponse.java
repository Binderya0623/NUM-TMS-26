package mn.num.edu.grading_service.application.dto;


public class ThesisSummaryResponse {
    private  String thesisId;
    private  String studentId;

    public ThesisSummaryResponse() {
    }

    public  String getThesisId() { return thesisId; }
    public void setThesisId( String thesisId) { this.thesisId = thesisId; }

    public  String getStudentId() { return studentId; }
    public void setStudentId( String studentId) { this.studentId = studentId; }
}