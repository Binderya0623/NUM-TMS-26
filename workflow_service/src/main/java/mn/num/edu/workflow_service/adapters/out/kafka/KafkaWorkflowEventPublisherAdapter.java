//package mn.num.edu.workflow_service.adapters.out.kafka;
//
//import mn.num.edu.workflow_service.application.port.out.WorkflowEventPublisherPort;
//import mn.num.edu.workflow_service.domain.event.WorkFlowStageActivatedEvent;
//import org.springframework.kafka.core.KafkaTemplate;
//import reactor.core.publisher.Mono;
//
//public class KafkaWorkflowEventPublisherAdapter implements WorkflowEventPublisherPort {
//
//    private final KafkaTemplate<String, Object> kafkaTemplate;
//
//    public KafkaWorkflowEventPublisherAdapter(KafkaTemplate<String, Object> kafkaTemplate) {
//        this.kafkaTemplate = kafkaTemplate;
//    }
//
//    @Override
//    public Mono<Void> publishStageActivated(WorkFlowStageActivatedEvent event) {
//        return Mono.fromFuture(
//                kafkaTemplate.send("workflow.stage.activated", event.stageId().toString(), event)
//        )    .doOnSuccess(result -> {
//                    System.out.println("✅ Kafka event sent");
//                    System.out.println("topic = " + result.getRecordMetadata().topic());
//                    System.out.println("partition = " + result.getRecordMetadata().partition());
//                    System.out.println("offset = " + result.getRecordMetadata().offset());
//                })
//                .doOnError(error -> {
//                    System.err.println("❌ Kafka send failed: " + error.getMessage());
//                })
//                .then();
//    }
//}