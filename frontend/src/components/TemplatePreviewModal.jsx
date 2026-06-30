import Modal from './Modal.jsx';
import ResumeView from './ResumeView.jsx';

export default function TemplatePreviewModal({ template, resumeData, onClose }) {
  return (
    <Modal title={`${template.name} Preview`} onClose={onClose}>
      <div className="max-h-[75vh] overflow-auto rounded-md border border-slate-200">
        <ResumeView
          data={{
            ...resumeData,
            resume: { ...resumeData.resume, template_slug: template.slug }
          }}
          template={template.slug}
        />
      </div>
    </Modal>
  );
}

