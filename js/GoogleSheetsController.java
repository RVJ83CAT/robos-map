import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
public class GoogleSheetsController {
    private static final String SPREADSHEET_ID = "TU_SPREADSHEET_ID"; // Reemplaza con el ID de tu Google Sheet
    private static final String APPLICATION_NAME = "TuApp";
    private static final String RANGE = "Sheet1!A1:D"; // Ajusta según tu rango de datos

    private Sheets getSheetsService() throws IOException, GeneralSecurityException {
        String credentialsJson = System.getenv("GOOGLE_CREDENTIALS");
        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(credentialsJson.getBytes()))
                .createScoped(Arrays.asList("https://www.googleapis.com/auth/spreadsheets"));
        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    @GetMapping("/coordinates")
    public List<List<Object>> getCoordinates() throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        ValueRange response = service.spreadsheets().values()
                .get(SPREADSHEET_ID, RANGE)
                .execute();
        return response.getValues();
    }

    @PostMapping("/coordinates")
    public ResponseEntity<String> updateCoordinates(@RequestBody Coordinate coordinate) 
            throws IOException, GeneralSecurityException {
        Sheets service = getSheetsService();
        List<List<Object>> values = Arrays.asList(
                Arrays.asList(coordinate.getId(), coordinate.getLatitude(), 
                            coordinate.getLongitude(), coordinate.getDescription())
        );
        ValueRange body = new ValueRange().setValues(values);
        service.spreadsheets().values()
                .append(SPREADSHEET_ID, RANGE, body)
                .setValueInputOption("RAW")
                .execute();
        return ResponseEntity.ok("Coordenada agregada");
    }
}

class Coordinate {
    private String id;
    private double latitude;
    private double longitude;
    private String description;

    // Getters y setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}